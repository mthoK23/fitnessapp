import React, { useState } from 'react';
import { Dumbbell, Flame, Timer, Utensils, Target } from 'lucide-react';
import { useApp } from '../store';
import { activities, categories, dailyStats, localDate, prettyDate, sum } from '../domain';
import {
  AddButton,
  Button,
  Empty,
  EntryForm,
  Field,
  Meter,
  Metric,
  Panel,
  Records,
} from '../components';

export function Tracker({ kind }) {
  const { data } = useApp();
  const workout = kind === 'workouts';
  const [date, setDate] = useState(localDate());
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [form, setForm] = useState(null);
  const stats = dailyStats(data, date);
  let rows = data[kind].filter(
    (row) =>
      (!date || row.date === date) &&
      (!filter || (workout ? row.status : row.category) === filter) &&
      (workout ? activities[row.activity][0] : row.name)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  rows = [...rows].sort((a, b) =>
    sort === 'calories'
      ? b.calories - a.calories
      : sort === 'oldest'
        ? a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0)
        : b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{workout ? 'MOVE WITH INTENTION' : 'FUEL YOUR EVERYDAY'}</span>
          <h1>{workout ? 'Your movement.' : 'Your nutrition.'}</h1>
          <p>
            {workout
              ? 'Log the effort. Plan the next step. Build a habit.'
              : 'A clear picture of what keeps you going.'}
          </p>
        </div>
        <AddButton onClick={() => setForm({})}>{workout ? 'Log workout' : 'Log meal'}</AddButton>
      </div>
      <div className="stats-grid three">
        <Metric
          label={workout ? 'Movement' : 'Meals logged'}
          value={
            workout
              ? date
                ? stats.minutes
                : sum(
                    data.workouts.filter((w) => w.status === 'completed'),
                    'duration',
                  )
              : data.meals.filter((m) => !date || m.date === date).length
          }
          unit={workout ? 'min' : ''}
          icon={workout ? Timer : Utensils}
          detail={date ? prettyDate(date) : 'All time'}
          accent
        />
        {workout ? (
          <>
            <Metric
              label="Completed workouts"
              value={
                data.workouts.filter((w) => w.status === 'completed' && (!date || w.date === date))
                  .length
              }
              icon={Dumbbell}
              detail="Planned workouts excluded"
            />
            <Metric
              label="Activity energy"
              value={Math.round(
                date
                  ? stats.burned
                  : sum(
                      data.workouts.filter((w) => w.status === 'completed'),
                      'calories',
                    ),
              )}
              unit="kcal"
              icon={Flame}
              detail="Estimated, not total daily expenditure"
            />
          </>
        ) : (
          <>
            <Metric
              label="Calories logged"
              value={Math.round(date ? stats.calories : sum(data.meals, 'calories'))}
              unit="kcal"
              icon={Utensils}
              detail={date ? `Target: ${data.profile.calorieGoal} kcal` : 'All logged meals'}
            />
            <Metric
              label="Protein logged"
              value={Math.round(date ? stats.protein : sum(data.meals, 'protein'))}
              unit="g"
              icon={Target}
              detail={date ? `Target: ${data.profile.proteinGoal} g` : 'All logged meals'}
            />
          </>
        )}
      </div>
      <Panel
        title={workout ? 'Workout journal' : 'Food journal'}
        action={<span className="tag">{rows.length} entries</span>}
      >
        <div className="filters">
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Button variant="secondary" onClick={() => setDate(date ? '' : localDate())}>
            {date ? 'All dates' : 'Today'}
          </Button>
          <Field label={workout ? 'Status' : 'Meal'}>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All {workout ? 'statuses' : 'meals'}</option>
              {(workout ? ['completed', 'planned'] : categories).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Search">
            <input
              placeholder={workout ? 'Find an activity…' : 'Find a meal…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
          <Field label="Sort">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="calories">Highest calories</option>
            </select>
          </Field>
        </div>
        {rows.length ? (
          <Records kind={kind} rows={rows} onEdit={(entry) => setForm({ entry })} />
        ) : (
          <Empty
            title={workout ? 'A fresh space for your next move' : 'Nothing on the menu yet'}
            action={
              <AddButton onClick={() => setForm({})}>
                {workout ? 'Add a workout' : 'Add a meal'}
              </AddButton>
            }
          >
            No entries match these filters. Start logging or choose another date.
          </Empty>
        )}
      </Panel>
      {!workout && date && (
        <Panel title="Your daily macros" className="macro-panel">
          <div className="macro-grid">
            <Meter label="Protein" value={stats.protein} goal={data.profile.proteinGoal} unit="g" />
            <div>
              <span>Carbohydrates</span>
              <h3>
                {stats.carbs.toFixed(1)} <small>g</small>
              </h3>
            </div>
            <div>
              <span>Fat</span>
              <h3>
                {stats.fat.toFixed(1)} <small>g</small>
              </h3>
            </div>
          </div>
        </Panel>
      )}
      {form && (
        <EntryForm kind={kind} date={date || localDate()} {...form} onClose={() => setForm(null)} />
      )}
    </>
  );
}
