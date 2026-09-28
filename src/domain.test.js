import { describe, it, expect } from 'vitest';
import {
  dailyStats,
  emptyData,
  goalProgress,
  localDate,
  pace,
  shiftDate,
  streak,
  validateRecord,
} from './domain';
describe('fitness calculations', () => {
  it('uses the local calendar date and crosses month boundaries', () => {
    expect(localDate(new Date(2026, 8, 28, 0, 5))).toBe('2026-09-28');
    expect(shiftDate('2024-03-01', -1)).toBe('2024-02-29');
  });
  it('excludes planned workouts and other dates from daily totals', () => {
    const data = emptyData();
    data.workouts = [
      { date: '2026-01-01', status: 'completed', duration: 30, calories: 300 },
      { date: '2026-01-01', status: 'planned', duration: 60, calories: 600 },
      { date: '2026-01-02', status: 'completed', duration: 50, calories: 500 },
    ];
    data.meals = [{ date: '2026-01-01', calories: 500, protein: 20, carbs: 30, fat: 10 }];
    expect(dailyStats(data, '2026-01-01')).toEqual({
      minutes: 30,
      burned: 300,
      calories: 500,
      protein: 20,
      carbs: 30,
      fat: 10,
      workouts: 1,
    });
  });
  it('counts unique consecutive completed days, allowing yesterday', () => {
    const workouts = ['2026-01-01', '2026-01-01', '2026-01-02'].map((date) => ({
      date,
      status: 'completed',
    }));
    workouts.push({ date: '2026-01-03', status: 'planned' });
    expect(streak(workouts, '2026-01-03')).toBe(2);
    expect(streak(workouts, '2026-01-04')).toBe(0);
  });
  it('supports weight loss, gain, missing goals and equal goals', () => {
    expect(goalProgress(100, 90, 80)).toBe(50);
    expect(goalProgress(60, 65, 70)).toBe(50);
    expect(goalProgress(100, 110, 80)).toBe(0);
    expect(goalProgress(100, 70, 80)).toBe(100);
    expect(goalProgress(80, 80, 80)).toBe(100);
    expect(goalProgress(null, 80, 75)).toBeNull();
  });
  it('carries rounded pace seconds into the next minute', () => {
    expect(pace(5.999, 1)).toBe('6:00 min/km');
    expect(pace(30, 0)).toBe('—');
  });
});
describe('record validation', () => {
  it('rejects impossible dates, invalid measurements, and future completed entries', () => {
    expect(() => validateRecord('measurements', { date: '2025-02-30', weight: 70 })).toThrow();
    expect(() => validateRecord('measurements', { date: '2025-01-01', weight: -1 })).toThrow();
    expect(() => validateRecord('measurements', { date: '2099-01-01', weight: 70 })).toThrow();
  });
  it('allows optional body fat without coercing it to zero', () => {
    expect(
      validateRecord('measurements', { date: '2025-01-01', weight: '70', bodyFat: '' }),
    ).toEqual({ date: '2025-01-01', weight: 70, bodyFat: null });
  });
  it('calculates calories itself and strips untrusted fields', () => {
    const result = validateRecord('workouts', {
      date: '2099-01-01',
      activity: 'running',
      status: 'planned',
      intensity: 'moderate',
      duration: '30',
      distance: '5',
      calories: 99999,
      userId: 'other',
    });
    expect(result.calories).toBe(300);
    expect(result.userId).toBeUndefined();
  });
  it('requires valid categories, finite nutrition, and positive targets', () => {
    expect(() =>
      validateRecord('meals', {
        date: '2025-01-01',
        name: 'Oats',
        category: 'Other',
        calories: 10,
      }),
    ).toThrow();
    expect(() =>
      validateRecord('meals', {
        date: '2025-01-01',
        name: 'Oats',
        category: 'Breakfast',
        calories: Infinity,
        protein: 0,
        fat: 0,
        carbs: 0,
      }),
    ).toThrow();
    expect(() =>
      validateRecord('profile', { ...emptyData().profile, name: 'Sam', minuteGoal: 0 }),
    ).toThrow();
  });
});
