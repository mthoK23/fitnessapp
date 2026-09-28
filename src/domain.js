export const activities = {
  running: ['Running', 10],
  walking: ['Walking', 4],
  cycling: ['Cycling', 8],
  strength: ['Strength training', 6],
  yoga: ['Yoga & mobility', 3],
  hiit: ['HIIT', 12],
  swimming: ['Swimming', 8],
  dancing: ['Dancing', 7],
};
export const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function shiftDate(date, amount) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return localDate(d);
}
export const prettyDate = (date, options = { month: 'short', day: 'numeric' }) =>
  new Date(`${date}T12:00:00`).toLocaleDateString(undefined, options);
export const emptyData = () => ({
  workouts: [],
  meals: [],
  measurements: [],
  profile: {
    name: '',
    calorieGoal: 2200,
    proteinGoal: 120,
    minuteGoal: 30,
    weeklyGoal: 4,
    startWeight: null,
    goalWeight: null,
  },
});
const fail = (message) => {
  throw new Error(message);
};
function number(value, label, min, max, optional = false) {
  if (optional && (value === '' || value == null)) return null;
  if (value === '' || value == null || !['number', 'string'].includes(typeof value))
    fail(`${label} is required.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max)
    fail(`${label} must be between ${min} and ${max}.`);
  return n;
}
function text(value, label, max = 100) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    fail(`${label} is required (maximum ${max} characters).`);
  return value.trim();
}
export function validateRecord(kind, input) {
  if (!input || typeof input !== 'object') fail('Invalid record.');
  if (kind === 'profile')
    return {
      name: text(input.name, 'Name', 50),
      calorieGoal: number(input.calorieGoal, 'Calorie target', 1, 10000),
      proteinGoal: number(input.proteinGoal, 'Protein target', 1, 1000),
      minuteGoal: number(input.minuteGoal, 'Daily movement target', 1, 1440),
      weeklyGoal: number(input.weeklyGoal, 'Weekly workout target', 1, 50),
      startWeight: number(input.startWeight, 'Starting weight', 20, 500, true),
      goalWeight: number(input.goalWeight, 'Goal weight', 20, 500, true),
    };
  const date = input.date;
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T12:00:00`)) ||
    localDate(new Date(`${date}T12:00:00`)) !== date ||
    date < '1900-01-01'
  )
    fail('Choose a valid date.');
  const latest = typeof window === 'undefined' ? shiftDate(localDate(), 1) : localDate();
  if (!(kind === 'workouts' && input.status === 'planned') && date > latest)
    fail('Completed entries cannot be in the future.');
  if (kind === 'meals') {
    if (!categories.includes(input.category)) fail('Choose a meal category.');
    return {
      date,
      name: text(input.name, 'Meal name'),
      category: input.category,
      calories: number(input.calories, 'Calories', 0, 10000),
      protein: number(input.protein, 'Protein', 0, 1000),
      carbs: number(input.carbs, 'Carbs', 0, 2000),
      fat: number(input.fat, 'Fat', 0, 1000),
    };
  }
  if (kind === 'measurements')
    return {
      date,
      weight: number(input.weight, 'Weight', 20, 500),
      bodyFat: number(input.bodyFat, 'Body fat', 1, 75, true),
    };
  if (kind === 'workouts') {
    if (!Object.hasOwn(activities, input.activity)) fail('Choose an activity.');
    if (!['light', 'moderate', 'intense'].includes(input.intensity)) fail('Choose an intensity.');
    if (!['completed', 'planned'].includes(input.status)) fail('Choose a workout status.');
    const duration = number(input.duration, 'Duration', 1, 1440);
    const distance = number(input.distance, 'Distance', 0, 1000, true);
    if (input.notes != null && (typeof input.notes !== 'string' || input.notes.length > 500))
      fail('Notes must be under 500 characters.');
    return {
      date,
      activity: input.activity,
      status: input.status,
      intensity: input.intensity,
      duration,
      distance,
      notes: (input.notes || '').trim(),
      calories: Math.round(
        duration *
          activities[input.activity][1] *
          { light: 0.8, moderate: 1, intense: 1.2 }[input.intensity],
      ),
    };
  }
  fail('Unknown record type.');
}
export const sum = (list, key) => list.reduce((total, item) => total + Number(item[key] || 0), 0);
export function dailyStats(data, date) {
  const workouts = data.workouts.filter((w) => w.date === date && w.status === 'completed');
  const meals = data.meals.filter((m) => m.date === date);
  return {
    minutes: sum(workouts, 'duration'),
    burned: sum(workouts, 'calories'),
    calories: sum(meals, 'calories'),
    protein: sum(meals, 'protein'),
    carbs: sum(meals, 'carbs'),
    fat: sum(meals, 'fat'),
    workouts: workouts.length,
  };
}
export function streak(workouts, today = localDate()) {
  const dates = new Set(workouts.filter((w) => w.status === 'completed').map((w) => w.date));
  let date = dates.has(today) ? today : shiftDate(today, -1);
  let count = 0;
  while (dates.has(date)) {
    count++;
    date = shiftDate(date, -1);
  }
  return count;
}
export function goalProgress(start, current, goal) {
  if (![start, current, goal].every((n) => typeof n === 'number' && Number.isFinite(n)))
    return null;
  if (start === goal) return current === goal ? 100 : 0;
  return Math.max(0, Math.min(100, ((current - start) / (goal - start)) * 100));
}
export function pace(duration, distance) {
  if (!distance) return '—';
  const seconds = Math.round((duration / distance) * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} min/km`;
}
