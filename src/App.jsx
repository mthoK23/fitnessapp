import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  ChartNoAxesCombined,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { useApp } from './store';
import { Button, Field } from './components';
import { Appearance, useMedia } from './preferences';
import { LoadFailure, PageSkeleton } from './Loading';
import { ErrorBoundary } from './ErrorBoundary';
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Tracker = lazy(() => import('./pages/Tracker').then((m) => ({ default: m.Tracker })));
const Progress = lazy(() => import('./pages/Progress').then((m) => ({ default: m.Progress })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
import { localDate, prettyDate } from './domain';

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <Activity size={24} />
      </span>
      fittrack<span className="brand-period">.</span>
    </span>
  );
}
function Auth() {
  const { authenticate, error: connectionError, refresh } = useApp();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await authenticate(mode, { username: form.get('username'), password: form.get('password') });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div className="auth-message">
          <span className="eyebrow">A LITTLE BETTER, EVERY DAY</span>
          <h1>
            Good habits.
            <br />
            Great energy.
            <br />
            <span>Your progress.</span>
          </h1>
          <p>
            A home for your movement, meals, and milestones.
            <br />
            Build a routine that feels like you.
          </p>
          <div className="auth-art" aria-hidden="true">
            <div />
            <Dumbbell size={125} strokeWidth={1.2} />
            <span>KEEP SHOWING UP ↗</span>
          </div>
        </div>
        <footer>YOUR PACE. YOUR PATH. YOUR FITTRACK.</footer>
      </section>
      <section className="auth-form-side">
        <Appearance compact />
        <span className="tag">YOUR NEXT CHAPTER STARTS HERE</span>
        <div className="auth-form">
          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'selected' : ''}
              disabled={busy}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Sign in
            </button>
            <button
              className={mode === 'register' ? 'selected' : ''}
              disabled={busy}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Create account
            </button>
          </div>
          <h2>{mode === 'login' ? 'Back for a better you.' : 'Start with a small step.'}</h2>
          <p>
            {mode === 'login'
              ? 'Welcome back. Let’s pick up where you left off.'
              : 'Create your account and make your first move.'}
          </p>
          {connectionError && (
            <div className="error" role="alert">
              {connectionError}
              <button className="text-link" onClick={refresh}>
                Retry connection
              </button>
            </div>
          )}
          <form key={mode} onSubmit={submit} aria-busy={busy}>
            <fieldset className="form-fields" disabled={busy}>
              <Field
                label="Username"
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]{3,30}"
                placeholder="Your username"
              />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={12}
                maxLength={128}
                placeholder={mode === 'register' ? 'At least 12 characters' : 'Your password'}
              />
              {mode === 'register' && (
                <p className="form-note">
                  Use 3–30 letters, numbers, or underscores for your username and a password of at
                  least 12 characters.
                </p>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <Button disabled={busy}>
                {busy ? 'Just a moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowUpRight size={18} />
              </Button>
            </fieldset>
          </form>
          <div className="auth-trust">
            <ShieldCheck size={19} />
            <span>Your own account. Your own progress.</span>
          </div>
          <p className="legacy-note">
            Used the original app? Create a new account here. Old browser-only accounts are not
            secure accounts and are not automatically imported.
          </p>
        </div>
        <footer>MAKE MOVEMENT A HABIT.</footer>
      </section>
    </main>
  );
}
const navigation = [
  ['/', 'Overview', LayoutDashboard],
  ['/workouts', 'Workouts', Dumbbell],
  ['/meals', 'Nutrition', Utensils],
  ['/progress', 'Progress', ChartNoAxesCombined],
  ['/profile', 'Profile & goals', Settings2],
];
function Shell() {
  const { user, data, logout, busy } = useApp();
  const mobile = useMedia('(max-width: 700px)');
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [location.pathname]);
  const name = data.profile.name || user.username;
  const title = navigation.find(([path]) => path === location.pathname)?.[1] || 'FitTrack';
  async function signOut() {
    setLeaving(true);
    try {
      await logout();
    } catch (e) {
      setError(e.message);
    } finally {
      setLeaving(false);
    }
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!mobile && (
        <aside className="sidebar">
          <Link to="/" aria-label="FitTrack home">
            <Brand />
          </Link>
          <div className="nav-label">YOUR WORKSPACE</div>
          <nav aria-label="Main navigation">
            {navigation.map(([path, label, Icon]) => (
              <NavLink key={path} to={path} end={path === '/'}>
                <Icon size={19} />
                {label}
                {path === '/progress' && <span className="nav-arrow">↗</span>}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="habit-note">
              <span className="tiny-cross">✳</span>
              <h3>
                Built one day
                <br />
                at a time.
              </h3>
              <p>
                Small steps are still steps.
                <br />
                You’ve got this.
              </p>
            </div>
            <div className="sidebar-account">
              <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{name}</strong>
                <span>Your personal space</span>
              </div>
              <button
                className="icon-button"
                disabled={busy || leaving}
                aria-label="Sign out"
                onClick={signOut}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>
      )}
      <div className="workspace">
        <header className="topbar">
          <div>
            {mobile ? (
              <Link to="/" aria-label="FitTrack home">
                <Brand />
              </Link>
            ) : (
              <span className="breadcrumb">
                My workspace <span>/</span> <strong>{title}</strong>
              </span>
            )}
          </div>
          <div className="topbar-right">
            {!mobile && <Appearance compact />}
            <span className="today-date">
              {prettyDate(localDate(), {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <Link to="/profile" className="avatar" aria-label="Open your profile">
              {name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="main-content">
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <ErrorBoundary key={location.pathname} inline>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/workouts" element={<Tracker key="workouts" kind="workouts" />} />
                <Route path="/meals" element={<Tracker key="meals" kind="meals" />} />
                <Route path="/progress" element={<Progress />} />
                <Route
                  path="/profile"
                  element={<Profile onSignOut={signOut} leaving={leaving} />}
                />
                <Route path="/user" element={<Navigate to="/profile" replace />} />
                <Route
                  path="*"
                  element={
                    <section className="not-found">
                      <span className="eyebrow">404 · OFF THE BEATEN PATH</span>
                      <h1>Let’s get you back on track.</h1>
                      <Link className="button primary" to="/">
                        Back to overview
                        <ArrowUpRight size={18} />
                      </Link>
                    </section>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <footer className="page-footer">
            <span>
              FITTRACK <span className="footer-dot">/</span> EVERY LITTLE BIT COUNTS.
            </span>
            <span>Move. Fuel. Grow.</span>
          </footer>
        </main>
      </div>
      {mobile && (
        <nav className="bottom-nav" aria-label="Main navigation">
          {navigation.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === '/'}>
              <span className="tab-icon">
                <Icon size={22} />
              </span>
              <span>{path === '/' ? 'Home' : path === '/profile' ? 'Profile' : label}</span>
            </NavLink>
          ))}
        </nav>
      )}
      {busy && (
        <div className="save-indicator" role="status">
          <span className="spinner" />
          Saving your changes…
        </div>
      )}
    </div>
  );
}
export default function App() {
  const { user, loading, error, refresh, loadFailed } = useApp();
  if (loading) return <PageSkeleton full />;
  if (loadFailed) return <LoadFailure message={error} onRetry={refresh} />;
  return user ? <Shell key={user.id} /> : <Auth />;
}
