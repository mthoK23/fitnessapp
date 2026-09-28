import React, { useState } from 'react';
import { Scale, Timer, Target, Check, Dumbbell, Pencil, Trash2, Trophy } from 'lucide-react';
import { useApp } from '../store';
import { goalProgress, localDate, prettyDate, shiftDate } from '../domain';
import { AddButton, Button, Empty, EntryForm, Metric, Modal, Panel } from '../components';
import { WeightChart } from '../charts';

export function Progress() {
  const { data, mutate, busy } = useApp();
  const [form, setForm] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [range, setRange] = useState('all');
  const all = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date));
  const rows = all.filter(
    (row) => range === 'all' || row.date >= shiftDate(localDate(), -Number(range) + 1),
  );
  const latest = all[0]?.weight;
  const start = data.profile.startWeight ?? all.at(-1)?.weight;
  const percent = goalProgress(start, latest, data.profile.goalWeight);
  const change = latest != null && start != null ? latest - start : null;
  const completed = data.workouts.filter((w) => w.status === 'completed');
  async function remove() {
    try {
      await mutate('measurements', null, pending.id, true);
      setPending(null);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEE HOW FAR YOU’VE COME</span>
          <h1>Small steps. Real progress.</h1>
          <p>Your journey is more than a number. Keep showing up.</p>
        </div>
        <AddButton onClick={() => setForm({})}>Log measurement</AddButton>
      </div>
      <div className="stats-grid three">
        <Metric
          label="Latest weight"
          value={latest ?? '—'}
          unit="kg"
          detail={all[0] ? prettyDate(all[0].date) : 'No measurements yet'}
          icon={Scale}
          accent
        />
        <Metric
          label="Change from start"
          value={change === null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}`}
          unit="kg"
          detail={start ? `Starting at ${start} kg` : 'Log a starting measurement'}
          icon={Timer}
        />
        <Metric
          label="Your weight goal"
          value={data.profile.goalWeight ?? '—'}
          unit="kg"
          detail={
            percent === null
              ? 'Set your goal in your profile'
              : `${Math.round(percent)}% of the way from your starting weight`
          }
          icon={Target}
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Your weight over time"
          action={
            <label className="sr-only-label">
              <span className="sr-only">Chart range</span>
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="all">All time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </label>
          }
        >
          <WeightChart entries={rows} />
        </Panel>
        <Panel title="Consistency looks good on you" className="milestones">
          <Trophy size={32} />
          <div className={completed.length ? 'milestone earned' : 'milestone'}>
            <Check size={16} />
            <div>
              <strong>First move</strong>
              <span>
                {completed.length ? 'First workout completed' : 'Complete your first workout'}
              </span>
            </div>
          </div>
          <div className={completed.length >= 10 ? 'milestone earned' : 'milestone'}>
            <Dumbbell size={16} />
            <div>
              <strong>Finding your rhythm</strong>
              <span>{Math.min(10, completed.length)} / 10 workouts</span>
            </div>
          </div>
          <div className={all.length >= 5 ? 'milestone earned' : 'milestone'}>
            <Scale size={16} />
            <div>
              <strong>Checking in</strong>
              <span>{Math.min(5, all.length)} / 5 measurements</span>
            </div>
          </div>
        </Panel>
      </div>
      <Panel
        title="Measurement history"
        action={<span className="tag">{rows.length} check-ins</span>}
      >
        {rows.length ? (
          <div className="table-scroll">
            <table className="measurement-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Body fat</th>
                  <th>Since previous</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const index = all.findIndex((r) => r.id === row.id);
                  const previous = all[index + 1];
                  const delta = previous ? row.weight - previous.weight : null;
                  return (
                    <tr key={row.id}>
                      <td data-label="Date">
                        {prettyDate(row.date, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td data-label="Weight">
                        <strong>{row.weight} kg</strong>
                      </td>
                      <td data-label="Body fat">{row.bodyFat == null ? '—' : `${row.bodyFat}%`}</td>
                      <td data-label="Change">
                        {delta == null
                          ? 'First entry'
                          : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg`}
                      </td>
                      <td>
                        <div className="record-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit measurement ${row.date}`}
                            onClick={() => setForm({ entry: row })}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={`Delete measurement ${row.date}`}
                            onClick={() => {
                              setError('');
                              setPending(row);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Your progress, one check-in at a time">
            Log a measurement to start your history, or expand the date range.
          </Empty>
        )}
      </Panel>
      {form && <EntryForm kind="measurements" {...form} onClose={() => setForm(null)} />}{' '}
      {pending && (
        <Modal title="Delete measurement?" busy={busy} onClose={() => setPending(null)}>
          <p>Your chart and progress will update after this entry is removed.</p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <footer className="form-actions">
            <Button variant="secondary" onClick={() => setPending(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={remove} disabled={busy}>
              Delete entry
            </Button>
          </footer>
        </Modal>
      )}
    </>
  );
}
