import React, {useState, useContext} from "react";
import {AppContext} from "../user/AppContext";
import './Progress.css';
import '../../styles/ProgressForm.css';
import './ProgressHistoryTable.css';
import "../../shared/styles/CaloricBalanceTable.css";
import '../workouts/Calender.css';
import CaloricBalanceTable from '../../shared/components/CaloricBalanceTable';
import ProgressHistoryTable from './ProgressHistoryTable';
import ProgressRings from './ProgressRings';
import BadgeGallery from '../badges/BadgesGalleryForm';


function Progress() {
  const { meals, workouts, progressData, addProgressEntry, getCaloricBalanceForDate, userProfile } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: ''
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setNewEntry({
      ...newEntry,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProgressEntry(newEntry);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: ''
    });
  };

  // Sort entries by date (newest first)
  const sortedEntries = [...progressData].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );
  
  // Calculate weight change over time
  const calculateChange = (index) => {
    if (index >= sortedEntries.length - 1) return { weightChange: null, bodyFatChange: null };
    const current = sortedEntries[index];
    const previous = sortedEntries[index + 1];
    const weightChange = previous ? (current.weight - previous.weight).toFixed(1) : null;
    const bodyFatChange = previous && current.bodyFat && previous.bodyFat ? 
      (current.bodyFat - previous.bodyFat).toFixed(1) : null;
    return { weightChange, bodyFatChange };
  };

  // Get latest weight and calculate change for summary
  const latestEntry = sortedEntries[0];
  const previousEntry = sortedEntries[1];
  const latestWeight = latestEntry ? latestEntry.weight : 0;
  const weightChange = previousEntry ? (latestWeight - previousEntry.weight).toFixed(1) : 0;

  //Rings Calculations 
  const today= new Date().toISOString().split('T')[0];
  const todaysMeals = meals.filter(meal => meal.date === today);
  const caloriesIn = todaysMeals.reduce((sum, meal) => sum+ (Number(meal.calories) || 0), 0);
  const todaysWorkouts = workouts.filter(workout => workout.date === today);
  const caloriesBurned = todaysWorkouts.reduce((sum, workout) => sum + (Number(workout.caloriesBurned) || 0), 0); 
 

  return (
    <main className="progress-container" role="main" aria-label="Progress Main Content">
      <header>
      <h1 className="progress-title">Progress Tracker</h1>
      </header>
      

      <section className="progress-summary-card" aria-label="Progress Details">
        <span className="summary-label">Latest Weight:</span>
        <span className="summary-value">{latestWeight} kg</span>
        <span className="summary-label">Change:</span>
        <span className={`summary-value ${weightChange > 0 ? 'increase' : 'decrease'}`}>
          {weightChange > 0 ? '+' : ''}{weightChange} kg
        </span>
      </section>

   
        
      
 {/* Main grid: left = rings+form, right = tables */}
      <section className="progress-main-grid" aria-label="Progress Details">
        {/* Left column: Rings and Form */}
        <section className="progress-left-col">
          <section className="progress-card progress-rings-card" aria-label="Progress Rings">
            <ProgressRings
              caloriesIn={caloriesIn}
              caloriesBurned={caloriesBurned}
              weight={latestWeight}
              weightGoal={userProfile.goalWeight || 100}
            />
          </section>
          <section className="progress-card progress-form-card" aria-label="Log New Measurment">
            <h2 className="form-title">Log New Measurement</h2>

            <form onSubmit={handleSubmit} className="progress-form">
              <section className="form-group" aria-label="Form Input">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newEntry.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </section>
              <section className="form-group" aria-label="Form Input">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={newEntry.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="form-input"
                  required
                />
              </section>
              <section className="form-group" aria-label="Form Input">
                <label className="form-label">Body Fat %</label>
                <input
                  type="number"
                  name="bodyFat"
                  value={newEntry.bodyFat}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="form-input"
                />
                <p className="form-note">Optional</p>
              </section>
              <button
                type="submit"
                className="submit-button"
              >
                Save Measurement
              </button>
            </form>
          </section>
        </section>
        {/* Right column: Tables */}
        <section className="progress-right-col">
          <section className="progress-card" aria-label="Progress History Table">
            <ProgressHistoryTable
              entries={sortedEntries}
              selectedDate={selectedDate}
              calculateChange={calculateChange}
            />
          </section>
          {sortedEntries.length > 0 && (
            <section className="progress-card" aria-label="Caloric Balance Table">
              <CaloricBalanceTable
                entries={sortedEntries}
                getCaloricBalanceForDate={getCaloricBalanceForDate}
              />
            </section>
          )}

            {/*---Badges Gallery */}
            <section className="progress-card" aria-label="Achievements Badges">
                <h2 className="progress-badges-title">
                  Your Achievements --- more badges coming soon
                </h2>
                <BadgeGallery earnedBadges={userProfile?.badges || []}/>
            </section>

        </section>
      </section>
    </main>
  );
}

export default Progress;