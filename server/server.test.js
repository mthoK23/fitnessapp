import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from './app.js';
const origin = 'http://localhost:5173';
async function fixture(t, options = {}) {
  const dataDir = options.dataDir || mkdtempSync(path.join(os.tmpdir(), 'fittrack-test-'));
  const app = createApp({ dataDir, origins: [origin], ...options });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  async function call(
    url,
    { method = 'GET', body, cookie, source = origin, expectedUser, requestId } = {},
  ) {
    const response = await fetch(`${base}/api${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Origin: source,
        ...(cookie ? { Cookie: cookie } : {}),
        ...(expectedUser ? { 'X-FitTrack-User': expectedUser } : {}),
        ...(requestId ? { 'X-Request-ID': requestId } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return {
      status: response.status,
      cookie: response.headers.get('set-cookie'),
      headers: response.headers,
      body: await response.json(),
    };
  }
  return { call, dataDir };
}
const password = 'a-strong-test-password';
test('retrying a create after a lost response does not duplicate records', async (t) => {
  const { call } = await fixture(t);
  const session = await call('/auth/register', {
    method: 'POST',
    body: { username: 'retry_user', password },
  });
  const cookie = session.cookie.split(';')[0];
  const requestId = '22222222-2222-4222-8222-222222222222';
  const body = {
    date: '2025-01-01',
    name: 'Oats',
    category: 'Breakfast',
    calories: 350,
    protein: 10,
    carbs: 50,
    fat: 8,
  };
  const args = { method: 'POST', cookie, requestId, body };
  assert.equal((await call('/data/meals', args)).body.data.meals.length, 1);
  assert.equal((await call('/data/meals', args)).body.data.meals.length, 1);
  assert.equal(
    (await call('/data/meals', { ...args, body: { ...body, calories: 500 } })).status,
    409,
  );
});
test('authentication, ownership, persistence, CRUD and logout', async (t) => {
  const { call, dataDir } = await fixture(t);
  assert.equal((await call('/session')).status, 401);
  const first = await call('/auth/register', {
    method: 'POST',
    body: { username: 'ALICE', password },
  });
  assert.equal(first.status, 201);
  assert.equal(first.body.user.username, 'alice');
  assert.match(first.cookie, /HttpOnly/);
  assert.match(first.cookie, /SameSite=Strict/);
  assert.equal(first.body.user.password, undefined);
  const alice = first.cookie.split(';')[0];
  const stored = readFileSync(path.join(dataDir, 'fittrack.json'), 'utf8');
  assert.ok(!stored.includes(password));
  assert.ok(!stored.includes(alice.split('=')[1]));
  assert.equal(
    (
      await call('/auth/login', {
        method: 'POST',
        body: { username: 'alice', password: 'wrong-password-123' },
      })
    ).status,
    401,
  );
  assert.equal(
    (await call('/auth/register', { method: 'POST', body: { username: 'Alice', password } }))
      .status,
    409,
  );
  const meal = {
    date: '2025-01-01',
    name: 'Oats',
    category: 'Breakfast',
    calories: 350,
    protein: 15,
    carbs: 50,
    fat: 8,
  };
  const created = await call('/data/meals', { method: 'POST', cookie: alice, body: meal });
  assert.equal(created.status, 201);
  const id = created.body.data.meals[0].id;
  const bob = (
    await call('/auth/register', { method: 'POST', body: { username: 'bob', password } })
  ).cookie.split(';')[0];
  assert.deepEqual((await call('/session', { cookie: bob })).body.data.meals, []);
  assert.equal(
    (
      await call('/data/meals', {
        method: 'POST',
        cookie: bob,
        body: meal,
        expectedUser: first.body.user.id,
      })
    ).status,
    409,
  );
  assert.equal(
    (await call(`/data/meals/${id}`, { method: 'PUT', cookie: bob, body: meal })).status,
    404,
  );
  assert.equal(
    (await call(`/data/meals/${id}`, { method: 'DELETE', cookie: bob, body: {} })).status,
    404,
  );
  assert.equal(
    (
      await call(`/data/meals/${id}`, {
        method: 'PUT',
        cookie: alice,
        body: { ...meal, calories: 400 },
      })
    ).body.data.meals[0].calories,
    400,
  );
  const restarted = await fixture(t, { dataDir });
  assert.equal(
    (await restarted.call('/session', { cookie: alice })).body.data.meals[0].calories,
    400,
  );
  assert.equal(
    (await call(`/data/meals/${id}`, { method: 'DELETE', cookie: alice, body: {} })).body.data.meals
      .length,
    0,
  );
  assert.equal(
    (await call('/auth/logout', { method: 'POST', cookie: alice, body: {} })).status,
    200,
  );
  assert.equal((await call('/session', { cookie: alice })).status, 401);
});
test('origin checks, validation, duplicate measurements, cookie forgery and expiry', async (t) => {
  let time = Date.now();
  const { call } = await fixture(t, { now: () => time });
  assert.equal(
    (
      await call('/auth/register', {
        method: 'POST',
        source: 'https://evil.example',
        body: { username: 'eve', password },
      })
    ).status,
    403,
  );
  assert.equal(
    (await call('/auth/register', { method: 'POST', body: { username: 'eve', password: 'short' } }))
      .status,
    400,
  );
  assert.equal((await call('/session', { cookie: 'fittrack_session=forged' })).status, 401);
  const session = await call('/auth/register', {
    method: 'POST',
    body: { username: 'eve', password },
  });
  const cookie = session.cookie.split(';')[0];
  const entry = { date: '2025-01-01', weight: 70, bodyFat: null };
  assert.equal(
    (await call('/data/measurements', { method: 'POST', cookie, body: entry })).status,
    201,
  );
  assert.equal(
    (await call('/data/measurements', { method: 'POST', cookie, body: entry })).status,
    409,
  );
  assert.equal(
    (await call('/data/measurements', { method: 'POST', cookie, body: { ...entry, weight: -10 } }))
      .status,
    400,
  );
  assert.equal((await call('/data/users', { method: 'POST', cookie, body: {} })).status, 404);
  const plan = {
    date: '2099-01-01',
    activity: 'running',
    status: 'planned',
    duration: 30,
    intensity: 'moderate',
    distance: 5,
    calories: 9000,
  };
  const result = await call('/data/workouts', { method: 'POST', cookie, body: plan });
  assert.equal(result.body.data.workouts[0].calories, 300);
  assert.equal(
    (
      await call('/data/workouts', {
        method: 'POST',
        cookie,
        body: { ...plan, status: 'completed' },
      })
    ).status,
    400,
  );
  time += 8 * 86400000;
  assert.equal((await call('/session', { cookie })).status, 401);
});
test('rate limiting, security headers and production cookie flags', async (t) => {
  const { call } = await fixture(t, { production: true });
  const result = await call('/auth/register', {
    method: 'POST',
    body: { username: 'secure_user', password },
  });
  assert.match(result.cookie, /Secure/);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.match(result.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  for (let i = 0; i < 29; i++) await call('/auth/login', { method: 'POST', body: {} });
  assert.equal((await call('/auth/login', { method: 'POST', body: {} })).status, 429);
});
