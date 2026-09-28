import React, { useContext, useState } from "react";
import { AppContext } from '../user/AppContext';
import MealForm from './MealForm';
import MealCard from './MealCard';
import Calendar from '../workouts/Calender';
import FilterSortBar from '../../shared/components/FilterSortBar';
import '../../shared/styles/filterBar.css';
import '../workouts/Calender.css';
import './meals.css';

function Meals() {
  const { meals, getMealsByDate } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory]= useState("");


  const mealsByDate = getMealsByDate();
  const availableDates = Object.keys(mealsByDate).sort().reverse();
  const selectedDateMeals = mealsByDate[selectedDate]?.meals || [];
  const hasMeals = selectedDateMeals.length > 0;
const allCategories = Array.from(new Set(meals.map(m => m.category || "Other")));

  // Overview stats for selected day
  const totalCalories = selectedDateMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const totalMeals = selectedDateMeals.length;

  // Calendar marks
  const markedDates = {};
  availableDates.forEach(date => {
    markedDates[date] = {
      count: mealsByDate[date]?.meals.length || 0,
      info: `${mealsByDate[date]?.totalCalories || 0} kcal`
    };
  });

  // Group by meal type
  const getMealsByType = (meals) => {
    const types = {};
    meals.forEach(meal => {
      const type = meal.type || 'Other';
      if (!types[type]) types[type] = [];
      types[type].push(meal);
    });
    return Object.entries(types).map(([type, meals]) => ({
      type,
      meals
    }));
  };

  // Filter and sort meals 
  let filteredMeals = selectedCategory
  ? selectedDateMeals.filter(m=> (m.category || "Other")=== selectedCategory)
  : selectedDateMeals;



  return (
      <main className="meals-modern-container" role="main" aria-label="Meal Main Content">

    <header className="meals-header-row">
      <h1 className="meals-title">Meal Tracker</h1>
      <button
        className="log-meal-btn"
        onClick={() => setShowForm(v => !v)}
      >
        + Log Meal
      </button>
    </header>

    <section className="meals-overview-top" aria-label="Meal Overview Stats">
      <section className="overview-stat">
        <span className="overview-label">Total Calories</span>
        <span className="overview-value">{totalCalories} kcal</span>
      </section>
      <section className="overview-stat">
        <span className="overview-label">Meals Logged</span>
        <span className="overview-value">{totalMeals}</span>
      </section>
    </section>

  <nav aria-label="Meal Filters">
    <FilterSortBar
      categories={allCategories}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
     
    />
  </nav>

    {/* Main Grid */}
    <section className="meals-main-grid" aria-label="Meals and Calender">
     
      <aside className="calendar-card" aria-label="Select Date">
        <h2 className="section-title">Select Date</h2>
        <Calendar
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          markedDates={markedDates}
          markType="meals"
          getDayInfo={date => markedDates[date]}
        />
      </aside>

      {/* Meals & Summary Section */}
      <section className="meals-content-card">
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
            <p className="summary-stats">
              <span className="summary-calories">{totalCalories} kcal</span> | 
              <span className="summary-meals">{totalMeals} meals</span>
            </p>
          </section>
        </section>
        {filteredMeals.length > 0 ? (
          <ul className="meals-grid" aria-label="Meals List">
            {filteredMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
              />
            ))}
          </ul>
        ) : (
          <aside className="no-data-container" role="alert" aria-alive="polite">
            <p className="no-data-message">No meals for this date.</p>
            <button
              className="add-meal-btn"
              onClick={() => setShowForm(true)}
              aria-label ="Add a new meal"
            >
              Add a meal
            </button>
          </aside>
        )}
      </section>
    </section>

    {/* Meal Form Modal/Section */}
    {showForm && (
      <section className="meal-form-modal" aria-role="dialog" aria-modal="true" aria-label="Log New Meal">
        <section className="meal-form-modal-bg" onClick={() => setShowForm(false)} />
        <section className="meal-form-modal-content">
          <MealForm />
          <button className="close-form-btn" onClick={() => setShowForm(false)}>Close</button>
        </section>
      </section>
    )}
  </main>
  );
}

export default Meals;