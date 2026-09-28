import React, { useContext, useState } from "react";
import { AppContext } from '../user/AppContext';
import {Link } from "react-router-dom";
import WorkoutForm from './WorkoutForm';
import WorkoutCard from './WorkoutCard';
import Calendar from './Calender';
import ScheduleWorkoutForm from './ScheduleWorkoutForm';

import FilterSortBar from '../../shared/components/FilterSortBar';
import '../../shared/styles/filterBar.css';
import './Calender.css';
import '../../shared/styles/BarChart.css';
import './workouts.css';


function Workouts() {
  const { workouts, getWorkoutsByDate, deleteWorkout } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const workoutsByDate = getWorkoutsByDate();
  const availableDates = Object.keys(workoutsByDate).sort().reverse();
  const allWorkouts = Object.values(workoutsByDate).flatMap(day => day.workouts || []);

  const totalAllTimeDuration = allWorkouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
  const totalAllTimeCalories = allWorkouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);
  const kgToLbs = kg => (kg * 2.20462).toFixed(1);
  const kmToMiles = km => (km * 0.621371).toFixed(2);
  const cmToFeet = cm => (cm/ 30.48).toFixed(2);

  const allCategories = Array.from(new Set(workouts.map(w => w.category || "Other")));


  const today = new Date();
  today.setHours (0,0,0,0);

  let streak=0;
  for (let i=0; ; i++){
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    if (workoutsByDate[dateStr] && (workoutsByDate[dateStr].workouts.length > 0)) {
      streak++;
    }else{
      break;
    }
  }

  const handleDeleteWorkout = (workoutID) => {
    if (window.confirm("Are you sure ?")) {
      deleteWorkout(workoutID);
    }
  };

  const getWorkoutsByCategory = (workouts) => {
    const categories = {};
    workouts.forEach(workout => {
      const category = workout.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(workout);
    });
    return Object.entries(categories).map(([category, workouts]) => ({
      category,
      workouts
    }));
  };

  const [showScheduleForm, setShowScheduleForm] = useState(false);
const [scheduledWorkouts, setScheduledWorkouts] = useState(() => {
  const saved = localStorage.getItem("scheduledWorkouts");
  return saved ? JSON.parse(saved) : [];
});

const handleSaveSchedule = (workout) => {
  setScheduledWorkouts(list => {
    const updated = [...list, workout];
    localStorage.setItem("scheduledWorkouts", JSON.stringify(updated));
    return updated;
  });
};

  const selectedDateWorkoutsRaw = workoutsByDate[selectedDate]?.workouts || [];
  const selectedDateWorkouts = selectedCategory
  ? selectedDateWorkoutsRaw.filter(w => (w.category || "Other") === selectedCategory)
  : selectedDateWorkoutsRaw;
const scheduledForSelectedDate = scheduledWorkouts.filter(sw => sw.date === selectedDate);

  const hasWorkouts = selectedDateWorkouts.length > 0;
  const totalCalories = workoutsByDate[selectedDate]?.totalCaloriesBurned || 0;
  const totalDuration = workoutsByDate[selectedDate]?.totalDuration || 0;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const markedDates = {};
  availableDates.forEach(date => {
    markedDates[date] = {
      count: workoutsByDate[date]?.workouts.length || 0,
      info: `${workoutsByDate[date]?.totalCaloriesBurned || 0} kcal`
    };
    scheduledWorkouts.forEach(sw => {
    if (!markedDates[sw.date]) {
    markedDates[sw.date] = { count: 0, info: "" };
    }
      markedDates[sw.date].scheduled = true;
    });
  });

  

    const { userProfile } =useContext(AppContext);
    const goalMinutes =Number(userProfile.dailyExerciseGoalMinutes) || 30;
    const caloriesPerMinute = Number(userProfile.caloriesPerMinute) || 7;
    const goalCalories = goalMinutes * caloriesPerMinute;

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === todayStr;
    const todaysWorkouts = workoutsByDate[todayStr]?.workouts || [];

    const minutesToday = todaysWorkouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
    const caloriesToday = todaysWorkouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);
    const goalMet = minutesToday>= goalMinutes;
    

  return (
  <main className="workouts-modern-container" aria-label="Workouts Main Content">
    {/* Overview Section */}
    <header className="workouts-header-row" aria-label="Workouts Header">
      <h1 className="workouts-title">Workout Tracker</h1>
      
      <button
        className="log-activity-btn"
        onClick={() => setShowForm(v => !v)}
        aria-label="Log a new activity"
        disabled={!isToday}
        style={!isToday ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      >
        + Log Activity
      </button>

      <button
        className="log-activity-btn"
        onClick={() => setShowScheduleForm(true)}
        aria-label="Schedule a workout"
      >
        + Schedule Workout
      </button>
    </header>

    {showScheduleForm && (
      <section aria-label="Schedule Workout Form">
        <ScheduleWorkoutForm
          onSave={handleSaveSchedule}
          onClose={() => setShowScheduleForm(false)}
        />
      </section>
    )}

    <section className="workouts-overview-top" aria-label="Workout Overview">
      <article className="overview-stat" aria-label="Current Workout Streak">
        <span className="overview-label">🔥Current Workout Streak 🔥</span>
        <span className="overview-value">{streak} day{streak === 1 ? "" : "s"}</span>
      </article>
      <article className="overview-stat" aria-label="Total Time Spent Exercising">
        <span className="overview-label">Total Time Spent Exercising </span>
        <span className="overview-value">{formatDuration(totalAllTimeDuration)}</span>
      </article>
      <article className="overview-stat" aria-label="Total Calories Burned">
        <span className="overview-label">Total Calories Burned </span>
        <span className="overview-value">{totalAllTimeCalories} kcal</span>
      </article>
      <nav aria-label="Filter Workouts">
        <FilterSortBar
          categories={allCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </nav>
    </section>

    <section className="workouts-goal-progress-card" aria-label="Daily Goals">
      <article className="overview-stat" aria-label="Daily Exercise Goal">
        <span className="overview-label">Daily Exercise Goal</span>
        <span className="overview-value">
          {goalMinutes} min ({goalCalories} kcal)
        </span>
      </article>
      <article className="overview-stat" aria-label="Today's Progress">
        <span className="overview-label">Today's Progress</span>
        <span className="overview-value">
          {minutesToday} / {goalMinutes} min · {caloriesToday} / {goalCalories} kcal
        </span>
      </article>
    </section>

    {(() => {
      const now = new Date();
      const isLate = now.getHours() >= 17;
      if (goalMet) {
        return (
          <section className="goal-reminder goal-success" role="status">
            🎉 You reached your daily exercise goal! Great job!
          </section>
        );
      } else if (isLate && !goalMet) {
        return (
          <section className="goal-reminder" role="status">
            You can still hit your daily goal. Go for a {goalMinutes}-minute walk!
          </section>
        );
      }
      return null;
    })()}

    {/* Main Grid */}
    <section className="workouts-main-grid" aria-label="Workouts and Calendar">
      {/* Calendar Section */}
      <aside className="calendar-card" aria-label="Workout Calendar">
        <h2 className="section-title">Select Date</h2>
        <Calendar
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          markedDates={markedDates}
          markType="workouts"
          getDayInfo={date => markedDates[date]}
        />
      </aside>

      {/* Workouts & Summary Section */}
      <section className="workouts-content-card" aria-label="Workouts for Selected Date">
        <header className="selected-date-header">
          <h2 className="date-title">
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
        </header>
        <section className="daily-summary" aria-label="Daily Summary">
          <section className="summary-content">
            <h3 className="summary-title">Daily Summary</h3>
            <section className="summary-stats">
              <span className="summary-calories">{totalCalories} kcal</span> burned | 
              <span className="summary-duration"> {formatDuration(totalDuration)}</span> total
            </section>
          </section>
        </section>
        
         {scheduledForSelectedDate.length > 0 && (
    <section className="scheduled-workouts-list" aria-label="Scheduled Workouts">
      <h4>Scheduled Workouts</h4>
      <ul>
        {scheduledForSelectedDate.map((sw, idx) => (
          <li key={idx}>
            {sw.type } on {sw.date}
          </li>
        ))}
      </ul>
    </section>
         )}

        {hasWorkouts ? (
          getWorkoutsByCategory(selectedDateWorkouts).map(group => (
            <section key={group.category} className="category-section" aria-label={`Category: ${group.category}`}>
              <h3 className="category-title">{group.category}</h3>
              <section className="workouts-grid">
                {group.workouts.map(workout => (
                  <section key={workout.id} className="workout-card-wrapper">
                  <Link
                    
                    to={`/workouts/${workout.id}`}
                    aria-label={`View details for ${workout.name}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <WorkoutCard
                      workout={workout}
                      onDelete={handleDeleteWorkout}
                      clickable
                    />
                  </Link>
                  </section>
                ))}
              </section>
            </section>
          ))
        ) : (
          <section className="no-data-container" role="alert">
            <p className="no-data-message">No workouts for this date.</p>
            <button
              className="add-workout-btn"
              onClick={() => setShowForm(true)}
              aria-label="Add a workout"
              disabled={!isToday}
              style={!isToday ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              Add a workout
            </button>
          </section>
        )}
      </section>
    </section>

    {/* Workout Form Modal/Section */}
    {showForm && (
      <section className="workout-form-modal" aria-label="Log Workout Modal">
        <section className="workout-form-modal-bg" onClick={() => setShowForm(false)} />
        <section className="workout-form-modal-content">
          <WorkoutForm />
          <button className="close-form-btn" onClick={() => setShowForm(false)} aria-label="Close workout form">Close</button>
        </section>
      </section>
    )}
  </main>
);
}

export default Workouts;