import express from 'express';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';
import { emptyData, validateRecord } from '../src/domain.js';

const derive = promisify(scrypt);
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const SESSION_MS = 1000 * 60 * 60 * 24 * 7;
const publicUser = (user) => ({ id: user.id, username: user.username });
const problem = (status, message) => Object.assign(new Error(message), { status });

export function createApp({
  dataDir = path.resolve('.data'),
  origins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3001'],
  production = false,
  now = Date.now,
} = {}) {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const file = path.join(dataDir, 'fittrack.json');
  // Fail closed on corrupt storage. Never silently replace existing user data.
  let db = existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf8'))
    : { version: 1, users: [], sessions: {} };
  if (db.version !== 1 || !Array.isArray(db.users) || !db.sessions)
    throw new Error('Unsupported or corrupt FitTrack database. Restore a backup.');
  const commit = (next) => {
    writeFileSync(`${file}.tmp`, JSON.stringify(next), { mode: 0o600 });
    renameSync(`${file}.tmp`, file);
    db = next;
  };
  const mutate = (fn) => {
    const next = structuredClone(db);
    const result = fn(next);
    commit(next);
    return result;
  };
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    });
    if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
    next();
  });
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (!origins.includes(req.get('origin')))
        return next(problem(403, 'This request came from an untrusted origin.'));
      if (!req.is('application/json')) return next(problem(415, 'Send JSON data.'));
    }
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  const attempts = new Map();
  function rateLimit(req, res, next) {
    const key = req.socket.remoteAddress;
    const time = now();
    for (const [ip, bucket] of attempts) if (bucket.reset <= time) attempts.delete(ip);
    const bucket = attempts.get(key) || { count: 0, reset: time + 15 * 60 * 1000 };
    bucket.count++;
    attempts.set(key, bucket);
    if (bucket.count > 30) {
      res.set('Retry-After', String(Math.ceil((bucket.reset - time) / 1000)));
      return next(problem(429, 'Too many sign-in attempts. Try again in 15 minutes.'));
    }
    next();
  }
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: production, path: '/' };
  function sessionKey(req) {
    const token = (req.headers.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('fittrack_session='))
      ?.slice(17);
    return token ? hashToken(token) : null;
  }
  function authenticate(req, res, next) {
    const key = sessionKey(req);
    const session = db.sessions[key];
    const user =
      session && session.expires > now() && db.users.find((u) => u.id === session.userId);
    if (!user) return next(problem(401, 'Your session has ended. Please sign in again.'));
    req.userId = user.id;
    next();
  }
  function createSession(req, res, userId) {
    const token = randomBytes(32).toString('hex');
    mutate((next) => {
      delete next.sessions[sessionKey(req)];
      for (const [key, value] of Object.entries(next.sessions))
        if (value.expires <= now()) delete next.sessions[key];
      next.sessions[hashToken(token)] = { userId, expires: now() + SESSION_MS };
    });
    res.cookie('fittrack_session', token, { ...cookieOptions, maxAge: SESSION_MS });
  }
  function credentials(body) {
    if (typeof body?.username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(body.username.trim()))
      throw problem(400, 'Use 3–30 letters, numbers, or underscores for your username.');
    if (
      typeof body.password !== 'string' ||
      body.password.length < 12 ||
      body.password.length > 128
    )
      throw problem(400, 'Use a password with 12–128 characters.');
    return { username: body.username.trim().toLowerCase(), password: body.password };
  }
  app.post('/api/auth/register', rateLimit, async (req, res) => {
    const { username, password } = credentials(req.body);
    const salt = randomBytes(16).toString('hex');
    const hash = (
      await derive(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 })
    ).toString('hex');
    // Recheck after the async hash to prevent concurrent duplicate registrations.
    if (db.users.some((u) => u.username === username))
      throw problem(409, 'This username is unavailable.');
    const user = { id: randomUUID(), username, salt, hash, data: emptyData() };
    user.data.profile.name = username;
    mutate((next) => next.users.push(user));
    createSession(req, res, user.id);
    res.status(201).json({ user: publicUser(user), data: user.data });
  });
  app.post('/api/auth/login', rateLimit, async (req, res) => {
    const { username, password } = credentials(req.body);
    const user = db.users.find((u) => u.username === username);
    const hash = await derive(password, user?.salt || '00000000000000000000000000000000', 64, {
      N: 32768,
      r: 8,
      p: 3,
      maxmem: 64 * 1024 * 1024,
    });
    if (!timingSafeEqual(hash, Buffer.from(user?.hash || '00'.repeat(64), 'hex')) || !user)
      throw problem(401, 'Incorrect username or password.');
    createSession(req, res, user.id);
    res.json({ user: publicUser(user), data: user.data });
  });
  app.post('/api/auth/logout', (req, res) => {
    mutate((next) => {
      delete next.sessions[sessionKey(req)];
    });
    res.clearCookie('fittrack_session', cookieOptions);
    res.json({ ok: true });
  });
  app.get('/api/session', authenticate, (req, res) => {
    const user = db.users.find((u) => u.id === req.userId);
    res.json({ user: publicUser(user), data: user.data });
  });
  app.use('/api/data', authenticate);
  app.use('/api/data', (req, res, next) => {
    if (req.get('X-FitTrack-User') && req.get('X-FitTrack-User') !== req.userId)
      return next(
        problem(409, 'The signed-in account changed in another tab. Reload before saving.'),
      );
    next();
  });
  app.put('/api/data/profile', (req, res) => {
    let profile;
    try {
      profile = validateRecord('profile', req.body);
    } catch (e) {
      throw problem(400, e.message);
    }
    const data = mutate((next) => {
      const user = next.users.find((u) => u.id === req.userId);
      user.data.profile = profile;
      return user.data;
    });
    res.json({ data });
  });
  app.use('/api/data/:kind', (req, res, next) => {
    if (!['workouts', 'meals', 'measurements'].includes(req.params.kind))
      return next(problem(404, 'Record type not found.'));
    next();
  });
  function saveRecord(req, res) {
    const { kind, id } = req.params;
    const requestId = req.get('X-Request-ID');
    if (
      requestId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
    )
      throw problem(400, 'Invalid request identifier.');
    let record;
    try {
      record = validateRecord(kind, req.body);
    } catch (e) {
      throw problem(400, e.message);
    }
    const data = mutate((next) => {
      const user = next.users.find((u) => u.id === req.userId);
      const list = user.data[kind];
      if (!id && requestId) {
        const existing = list.find((row) => row.id === requestId);
        if (existing) {
          if (Object.keys(record).some((key) => record[key] !== existing[key]))
            throw problem(
              409,
              'Your earlier entry was saved. Close this form, reload, and edit that entry.',
            );
          return user.data;
        }
      }
      if (id && !list.some((row) => row.id === id)) throw problem(404, 'Entry not found.');
      if (kind === 'measurements' && list.some((row) => row.date === record.date && row.id !== id))
        throw problem(409, 'A measurement already exists for this date. Edit that entry instead.');
      if (!id && list.length >= 10000)
        throw problem(409, 'Record limit reached. Export and remove older entries.');
      record.id = id || requestId || randomUUID();
      record.createdAt = list.find((row) => row.id === id)?.createdAt || now();
      user.data[kind] = id ? list.map((row) => (row.id === id ? record : row)) : [...list, record];
      return user.data;
    });
    res.status(id ? 200 : 201).json({ data });
  }
  app.post('/api/data/:kind', saveRecord);
  app.put('/api/data/:kind/:id', saveRecord);
  app.delete('/api/data/:kind/:id', (req, res) => {
    const data = mutate((next) => {
      const user = next.users.find((u) => u.id === req.userId);
      const list = user.data[req.params.kind];
      if (!list.some((row) => row.id === req.params.id)) throw problem(404, 'Entry not found.');
      user.data[req.params.kind] = list.filter((row) => row.id !== req.params.id);
      return user.data;
    });
    res.json({ data });
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use(express.static(path.resolve('dist'), { index: false }));
  app.get('/{*path}', (req, res) => {
    if (existsSync(path.resolve('dist/index.html'))) res.sendFile(path.resolve('dist/index.html'));
    else
      res.status(404).send('Run npm start for development, or npm run build then npm run serve.');
  });
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status === 500) console.error('Request failed:', err.message);
    res.status(status).json({
      error:
        status === 500
          ? 'Could not save your changes. Please try again.'
          : status === 413
            ? 'This request is too large.'
            : err.message,
    });
  });
  return app;
}
