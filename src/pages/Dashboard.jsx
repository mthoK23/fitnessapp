import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Dumbbell, Flame, Timer, Scale, Utensils, Footprints } from 'lucide-react';
import { useApp } from '../store';
import { activities, dailyStats, localDate, prettyDate, shiftDate, streak, sum } from '../domain';
import { AddButton, Button, Empty, EntryForm, Meter, Metric, Panel, Records } from '../components';
import { WeekChart } from '../charts';

export function Dashboard() {
  const { data } = useApp();
  const [form, setForm] = useState(null);
  const today = localDate();
  const stats = dailyStats(data, today);
  const mealCount = data.meals.filter((m) => m.date === today).length;
  const streakDays = streak(data.workouts);
  const completed = data.workouts.filter((w) => w.status === 'completed');
  const week = completed.filter((w) => w.date >= shiftDate(today, -6) && w.date <= today);
  const latest = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date))[0];
  const plans = data.workouts
    .filter((w) => w.status === 'planned' && w.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR EVERYDAY PROGRESS</span>
          <h1>
            Let’s keep you moving<span className="lime-dot">.</span>
          </h1>
          <p>A little consistency. A stronger you.</p>
        </div>
        <AddButton onClick={() => setForm({ kind: 'workouts' })} />
      </div>
      <div className="hero">
        <div>
          <div className="hero-kicker">
            <span className="live-dot" /> ONE DAY AT A TIME
          </div>
          <h2>
            Show up for
            <br />
            your future self.
          </h2>
          <p>
            {week.length
              ? `${week.length} workout${week.length === 1 ? '' : 's'} in the last 7 days. Keep building your rhythm.`
              : 'Every rep, every meal, every small step. It all adds up.'}
          </p>
          <Button variant="dark" onClick={() => setForm({ kind: 'workouts' })}>
            Make today count
            <ArrowUpRight size={18} />
          </Button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-tile">
            <Dumbbell strokeWidth={1.6} />
          </div>
          <span className="art-plus plus-one">+</span>
          <span className="art-plus plus-two">+</span>
          <div className="art-label">PROGRESS, NOT PERFECTION ↗</div>
        </div>
      </div>
      <div className="stats-grid">
        <Metric
          label="Movement today"
          value={stats.minutes}
          unit="min"
          icon={Timer}
          detail={`${data.profile.minuteGoal} min daily target`}
          accent
        />
        <Metric
          label="Calories logged"
          value={Math.round(stats.calories).toLocaleString()}
          unit="kcal"
          icon={Utensils}
          detail={`${mealCount} meal${mealCount === 1 ? '' : 's'} logged today`}
        />
        <Metric
          label="Current streak"
          value={streakDays}
          unit={streakDays === 1 ? 'day' : 'days'}
          icon={Flame}
          detail="Keep your movement habit going"
        />
        <Metric
          label="Latest weight"
          value={latest?.weight ?? '—'}
          unit="kg"
          icon={Scale}
          detail={
            latest
              ? `Last check-in · ${prettyDate(latest.date)}`
              : 'Your first check-in is a fresh start'
          }
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Your week in motion"
          eyebrow="THE BIG PICTURE"
          action={<span className="tag">Last 7 days</span>}
        >
          <WeekChart data={data} />
          <div className="chart-footer">
            <span>
              <strong>{sum(week, 'duration')}</strong> total minutes
            </span>
            <span>
              <strong>{week.length}</strong> workout{week.length === 1 ? '' : 's'} completed
            </span>
            <span>
              <strong>{Math.round(sum(week, 'calories'))}</strong> kcal estimated
            </span>
          </div>
        </Panel>
        <Panel title="Today’s targets" eyebrow="SMALL WINS" className="targets">
          <Meter label="Movement" value={stats.minutes} goal={data.profile.minuteGoal} unit="min" />
          <Meter
            label="Nutrition"
            value={stats.calories}
            goal={data.profile.calorieGoal}
            unit="kcal"
          />
          <Meter label="Protein" value={stats.protein} goal={data.profile.proteinGoal} unit="g" />
          <Link className="text-link" to="/profile">
            Adjust your targets
            <ArrowUpRight size={16} />
          </Link>
        </Panel>
        <Panel
          title="Recent activity"
          action={
            <Link className="text-link" to="/workouts">
              View all
              <ArrowUpRight size={16} />
            </Link>
          }
        >
          {completed.length ? (
            <Records
              kind="workouts"
              compact
              rows={[...completed]
                .sort(
                  (a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0),
                )
                .slice(0, 3)}
            />
          ) : (
            <Empty
              title="Your next chapter starts here"
              action={
                <Button variant="secondary" onClick={() => setForm({ kind: 'workouts' })}>
                  Log your first workout
                </Button>
              }
            >
              A walk around the block counts, too.
            </Empty>
          )}
        </Panel>
        <section className="next-card">
          <span className="eyebrow">UP NEXT</span>
          <div className="next-icon">
            <Footprints size={28} />
          </div>
          <h2>{plans.length ? activities[plans[0].activity][0] : 'Make room for movement.'}</h2>
          <p>
            {plans.length
              ? `${prettyDate(plans[0].date)} · ${plans[0].duration} minutes planned`
              : 'Put a workout on your calendar. Give yourself something to show up for.'}
          </p>
          <Button
            variant="secondary"
            onClick={() =>
              setForm({
                kind: 'workouts',
                entry: plans[0] || {
                  date: today,
                  activity: 'walking',
                  duration: 30,
                  distance: '',
                  intensity: 'moderate',
                  status: 'planned',
                  notes: '',
                },
              })
            }
          >
            {plans.length ? 'View your plan' : 'Plan a workout'}
            <ArrowUpRight size={16} />
          </Button>
        </section>
      </div>
      <div className="quick-strip">
        <span>BUILD YOUR DAILY ROUTINE</span>
        <button onClick={() => setForm({ kind: 'meals' })}>
          <Utensils size={18} />
          Log a meal
          <ArrowUpRight size={16} />
        </button>
        <button onClick={() => setForm({ kind: 'measurements' })}>
          <Scale size={18} />
          Check in on your progress
          <ArrowUpRight size={16} />
        </button>
      </div>
      {form && <EntryForm {...form} onClose={() => setForm(null)} />}
    </>
  );
}
