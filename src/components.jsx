import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  Dumbbell,
  Utensils,
  Check,
  Activity,
} from 'lucide-react';
import { activities, categories, localDate, prettyDate, validateRecord, pace } from './domain';
import { useApp } from './store';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
export function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <Activity size={28} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Panel({ title, eyebrow, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Metric({ label, value, unit, detail, icon: Icon = Activity, accent = false }) {
  return (
    <article className={`metric ${accent ? 'accent' : ''}`}>
      <div className="metric-label">
        {label}
        <Icon size={18} />
      </div>
      <div className="metric-value">
        {value}
        <span>{unit}</span>
      </div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}
export function Meter({ value, goal, label, unit = '', dark = false }) {
  const percent = Math.min(100, Math.max(0, (value / goal) * 100));
  return (
    <div className={`meter ${dark ? 'dark-meter' : ''}`}>
      <div>
        <span>{label}</span>
        <strong>
          {Math.round(value).toLocaleString()}{' '}
          <small>
            / {goal.toLocaleString()} {unit}
          </small>
        </strong>
      </div>
      <progress max="100" value={percent} aria-label={label} />
    </div>
  );
}
export function Modal({ title, children, onClose, busy = false }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header>
        <div>
          <span className="eyebrow">MAKE IT COUNT</span>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button className="icon-button" aria-label="Close dialog" disabled={busy} onClick={onClose}>
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function EntryForm({ kind, entry, date, onClose }) {
  const { mutate, busy } = useApp();
  const requestId = useRef(crypto.randomUUID());
  const [error, setError] = useState('');
  const [form, setForm] = useState(
    () =>
      entry ||
      (kind === 'workouts'
        ? {
            date: date || localDate(),
            activity: 'running',
            duration: '',
            distance: '',
            intensity: 'moderate',
            status: (date || localDate()) > localDate() ? 'planned' : 'completed',
            notes: '',
          }
        : kind === 'meals'
          ? {
              date: date || localDate(),
              name: '',
              category: 'Breakfast',
              calories: '',
              protein: 0,
              carbs: 0,
              fat: 0,
            }
          : { date: date || localDate(), weight: '', bodyFat: '' }),
  );
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const input = (name, label, props = {}) => (
    <Field label={label} name={name} value={form[name] ?? ''} onChange={change} {...props} />
  );
  const select = (name, label, options) => (
    <Field label={label}>
      <select name={name} value={form[name]} onChange={change}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </Field>
  );
  const title = kind === 'workouts' ? 'workout' : kind === 'meals' ? 'meal' : 'measurement';
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const value = validateRecord(kind, form);
      await mutate(kind, value, entry?.id, false, requestId.current);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Modal
      title={`${entry?.id ? 'Edit' : form.status === 'planned' ? 'Plan a' : 'Log a'} ${title}`}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="form-fields" disabled={busy}>
          <div className="form-grid">
            {input('date', 'Date', {
              type: 'date',
              required: true,
              min: '1900-01-01',
              max: kind === 'workouts' && form.status === 'planned' ? undefined : localDate(),
            })}
            {kind === 'workouts' && (
              <>
                {select('status', 'Status', [
                  ['completed', 'Completed'],
                  ['planned', 'Planned'],
                ])}
                {select(
                  'activity',
                  'Activity',
                  Object.entries(activities).map(([key, [name]]) => [key, name]),
                )}
                {select('intensity', 'Intensity', [
                  ['light', 'Light'],
                  ['moderate', 'Moderate'],
                  ['intense', 'Intense'],
                ])}
                {input('duration', 'Duration (minutes)', {
                  type: 'number',
                  min: 1,
                  max: 1440,
                  step: 'any',
                  required: true,
                })}
                {input('distance', 'Distance (km, optional)', {
                  type: 'number',
                  min: 0,
                  max: 1000,
                  step: 'any',
                })}
                <label className="field full">
                  <span>Notes (optional)</span>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={change}
                    maxLength={500}
                    rows={3}
                  />
                </label>
                <p className="form-note full">
                  Calories are an activity estimate. Planned workouts count toward your totals only
                  after you mark them complete.
                </p>
              </>
            )}
            {kind === 'meals' && (
              <>
                {select(
                  'category',
                  'Meal',
                  categories.map((c) => [c, c]),
                )}
                {input('name', 'Meal name', {
                  required: true,
                  maxLength: 100,
                  placeholder: 'e.g. Oats with banana',
                })}
                {input('calories', 'Calories (kcal)', {
                  type: 'number',
                  min: 0,
                  max: 10000,
                  step: 'any',
                  required: true,
                })}
                {['protein', 'carbs', 'fat'].map((name) => (
                  <React.Fragment key={name}>
                    {input(name, `${name[0].toUpperCase() + name.slice(1)} (g)`, {
                      type: 'number',
                      min: 0,
                      max: name === 'carbs' ? 2000 : 1000,
                      step: 'any',
                      required: true,
                    })}
                  </React.Fragment>
                ))}
                <p className="form-note full">
                  Enter the nutrition values for your whole serving from its label or recipe.
                </p>
              </>
            )}
            {kind === 'measurements' && (
              <>
                {input('weight', 'Weight (kg)', {
                  type: 'number',
                  min: 20,
                  max: 500,
                  step: 'any',
                  required: true,
                })}
                {input('bodyFat', 'Body fat (%, optional)', {
                  type: 'number',
                  min: 1,
                  max: 75,
                  step: 'any',
                })}
                <p className="form-note full">
                  One measurement per day keeps your trend consistent. You can edit any previous
                  entry.
                </p>
              </>
            )}
          </div>
          {error && (
            <p role="alert" className="error">
              <strong>Saving paused. </strong>
              {error} Your entries are still here.
            </p>
          )}
          <footer className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button disabled={busy}>
              {busy ? 'Saving…' : error ? 'Retry save' : 'Save entry'}
              <Check size={16} />
            </Button>
          </footer>
        </fieldset>
      </form>
    </Modal>
  );
}
export function Records({ kind, rows, onEdit, compact = false }) {
  const { mutate, busy } = useApp();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  async function remove() {
    try {
      await mutate(kind, null, pending.id, true);
      setPending(null);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <div className="record-list">
        {rows.map((row) => {
          const workout = kind === 'workouts';
          const Icon = workout ? Dumbbell : Utensils;
          return (
            <article className="record" key={row.id}>
              <div className={`record-icon ${row.status === 'planned' ? 'planned-icon' : ''}`}>
                <Icon size={20} />
              </div>
              <div className="record-main">
                <strong>{workout ? activities[row.activity]?.[0] : row.name}</strong>
                <span>
                  {prettyDate(row.date)} ·{' '}
                  {workout
                    ? `${row.duration} min${row.distance ? ` · ${row.distance} km · ${pace(row.duration, row.distance)}` : ''}`
                    : `${row.category} · ${row.protein} g protein`}
                </span>
                {!compact && row.notes && <p>{row.notes}</p>}
              </div>
              <div className="record-value">
                {row.status === 'planned' ? (
                  <span className="tag">Planned</span>
                ) : (
                  <>
                    <strong>{Math.round(row.calories)}</strong>
                    <span>kcal{workout ? ' est.' : ''}</span>
                  </>
                )}
              </div>
              {!compact && (
                <div className="record-actions">
                  <button
                    className="icon-button"
                    aria-label={`Edit ${workout ? activities[row.activity][0] : row.name}`}
                    onClick={() => onEdit(row)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${workout ? activities[row.activity][0] : row.name}`}
                    onClick={() => {
                      setError('');
                      setPending(row);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {pending && (
        <Modal title="Delete this entry?" busy={busy} onClose={() => setPending(null)}>
          <p>This entry will be removed from your history and totals.</p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <footer className="form-actions">
            <Button variant="secondary" disabled={busy} onClick={() => setPending(null)}>
              Keep entry
            </Button>
            <Button disabled={busy} onClick={remove}>
              Delete entry
            </Button>
          </footer>
        </Modal>
      )}
    </>
  );
}
export function AddButton({ onClick, children = 'Log workout' }) {
  return (
    <Button onClick={onClick}>
      <Plus size={17} />
      {children}
    </Button>
  );
}
export function TextLink({ children, ...props }) {
  return (
    <button className="text-link" {...props}>
      {children}
      <ArrowUpRight size={16} />
    </button>
  );
}
