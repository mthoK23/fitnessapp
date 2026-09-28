import React, { useState } from 'react';
import { Download, Check, Target, LogOut } from 'lucide-react';
import { Appearance } from '../preferences';
import { useApp } from '../store';
import { localDate, shiftDate, validateRecord } from '../domain';
import { Button, Field, Panel } from '../components';

export function Profile({ onSignOut, leaving }) {
  const { data, user, mutate, busy } = useApp();
  const [form, setForm] = useState(data.profile);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const change = (e) => {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await mutate('profile', validateRecord('profile', form));
      setSaved(true);
    } catch (e) {
      setError(e.message);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { version: 2, exportedAt: new Date().toISOString(), username: user.username, ...data },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack-${localDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>Your goals. Your pace.</h1>
          <p>Set targets that fit your life, and adjust them as you grow.</p>
        </div>
      </div>
      <div className="profile-grid">
        <Panel title="Profile & targets">
          <form onSubmit={submit}>
            <fieldset className="form-fields" disabled={busy} aria-busy={busy}>
              <div className="form-grid">
                <Field
                  label="Display name"
                  name="name"
                  value={form.name}
                  onChange={change}
                  required
                  maxLength={50}
                />
                <Field label="Username" value={user.username} readOnly />
                {[
                  ['calorieGoal', 'Daily calories (kcal)', 1, 10000],
                  ['proteinGoal', 'Daily protein (g)', 1, 1000],
                  ['minuteGoal', 'Daily movement (minutes)', 1, 1440],
                  ['weeklyGoal', 'Weekly workouts', 1, 50],
                  ['startWeight', 'Starting weight (kg, optional)', 20, 500],
                  ['goalWeight', 'Goal weight (kg, optional)', 20, 500],
                ].map(([name, label, min, max]) => (
                  <Field
                    key={name}
                    label={label}
                    name={name}
                    type="number"
                    min={min}
                    max={max}
                    step="any"
                    required={!['startWeight', 'goalWeight'].includes(name)}
                    value={form[name] ?? ''}
                    onChange={change}
                  />
                ))}
              </div>
              <p className="form-note">
                Targets are personal preferences, not recommendations. All measurements use
                kilograms and kilometres.
              </p>
              {error && (
                <p role="alert" className="error">
                  <strong>Saving paused. </strong>
                  {error} Your changes are still here.
                </p>
              )}
              {saved && (
                <p role="status" className="success">
                  Your profile and targets are saved.
                </p>
              )}
              <footer className="form-actions">
                <Button disabled={busy}>
                  {busy ? 'Saving…' : error ? 'Retry save' : 'Save changes'}
                  <Check size={16} />
                </Button>
              </footer>
            </fieldset>
          </form>
        </Panel>
        <div>
          <Panel title="Make yourself comfortable" className="appearance-panel">
            <Appearance />
            <p className="form-note">
              System follows your device. Your choice is remembered on this browser.
            </p>
          </Panel>
          <Panel title="Your data belongs to you" eyebrow="YOUR ACCOUNT">
            <div className="profile-avatar">{form.name.slice(0, 1).toUpperCase()}</div>
            <h3>@{user.username}</h3>
            <p className="muted">
              Your records are saved to this FitTrack server and kept separate from other accounts.
            </p>
            <Button variant="secondary" onClick={download}>
              <Download size={16} />
              Export my data
            </Button>
            <p className="form-note">
              Downloads workouts, meals, measurements, and targets as JSON.
            </p>
            <Button
              variant="secondary"
              className="profile-signout"
              onClick={onSignOut}
              disabled={busy || leaving}
            >
              <LogOut size={16} />
              {leaving ? 'Signing out…' : 'Sign out of FitTrack'}
            </Button>
          </Panel>
          <div className="profile-note">
            <Target size={25} />
            <h3>Make your goals work for you.</h3>
            <p>Consistency beats intensity. Pick a starting point you can return to.</p>
            <p>
              {
                data.workouts.filter(
                  (w) =>
                    w.status === 'completed' &&
                    w.date >= shiftDate(localDate(), -6) &&
                    w.date <= localDate(),
                ).length
              }{' '}
              / {data.profile.weeklyGoal} workouts in the last 7 days.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
