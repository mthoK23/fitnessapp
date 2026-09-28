import React from 'react';
import { dailyStats, localDate, prettyDate, shiftDate } from './domain';
export function WeekChart({ data, days = 7 }) {
  const today = localDate();
  const rows = Array.from({ length: days }, (_, i) => {
    const date = shiftDate(today, i - days + 1);
    return { date, value: dailyStats(data, date).minutes };
  });
  const max = Math.max(data.profile.minuteGoal, ...rows.map((r) => r.value), 1);
  return (
    <>
      <div className="chart-legend">
        <span className="legend-dot" /> Movement minutes{' '}
        <span className="muted">Daily target: {data.profile.minuteGoal} min</span>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={rows.map((r) => `${prettyDate(r.date)}: ${r.value} minutes`).join('; ')}
      >
        {rows.map((row) => (
          <div className="bar-column" key={row.date}>
            <div className="bar-track">
              <span className="bar-number">{row.value || '—'}</span>
              <div
                className={`bar ${row.date === today ? 'today-bar' : ''}`}
                style={{ height: `${(row.value / max) * 100}%`, minHeight: row.value ? 5 : 2 }}
              />
            </div>
            <span className={row.date === today ? 'today-label' : ''}>
              {prettyDate(row.date, { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
export function WeightChart({ entries }) {
  const rows = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (!rows.length)
    return (
      <div className="chart-empty">
        <span className="empty-line" />
        <p>Your trend starts with your first measurement.</p>
      </div>
    );
  const min = Math.min(...rows.map((r) => r.weight)) - 1;
  const max = Math.max(...rows.map((r) => r.weight)) + 1;
  const start = Date.parse(rows[0].date);
  const span = Date.parse(rows.at(-1).date) - start;
  const points = rows.map((row) => ({
    x: span ? 48 + ((Date.parse(row.date) - start) / span) * 500 : 298,
    y: 170 - ((row.weight - min) / (max - min)) * 140,
    row,
  }));
  return (
    <div className="weight-chart">
      <svg
        viewBox="0 0 580 220"
        role="img"
        aria-label={`Weight trend: ${rows.map((r) => `${r.date}, ${r.weight} kg`).join('; ')}`}
      >
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line
              x1="45"
              x2="555"
              y1={30 + i * 70}
              y2={30 + i * 70}
              stroke="var(--line)"
              strokeDasharray="4 5"
            />
            <text x="0" y={34 + i * 70}>
              {(max - (i * (max - min)) / 2).toFixed(1)}
            </text>
          </g>
        ))}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {points.map(({ x, y, row }) => (
          <circle
            key={row.id}
            cx={x}
            cy={y}
            r="5"
            fill="var(--lime)"
            stroke="var(--ink)"
            strokeWidth="2"
          >
            <title>
              {prettyDate(row.date)}: {row.weight} kg
            </title>
          </circle>
        ))}
        <text x="48" y="207">
          {prettyDate(rows[0].date)}
        </text>
        <text x="548" y="207" textAnchor="end">
          {rows.length > 1 ? prettyDate(rows.at(-1).date) : 'First check-in'}
        </text>
      </svg>
    </div>
  );
}
