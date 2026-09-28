import React, { useState, useContext } from 'react';
import { AppContext } from '../user/AppContext';
import './WorkoutForm.css';

const WorkoutForm = () => {
  const { addWorkout, workoutData } = useContext(AppContext);
  const [formData, setFormData] = useState({
    activityId: '',
    hours: 0, 
    minutes: 0,
    seconds: 0,
    intensity: 'moderate',
    distance: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState("");

  // Find the selected activity
  const selectedActivity = workoutData.find(activity => activity.id === formData.activityId);
  const showDistanceField = selectedActivity?.trackDistance;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTimeChange = (e) =>{
    const {name, value} = e.target;
    const numValue = Math.max(0, parseInt(value) ||0);
    const validValue = name === 'hours' ? numValue: Math.min(59, numValue);
    setFormData({
      ...formData,
      [name]: validValue
    });
  };

  const calculateTotalMinutes = () =>{
    const hours = parseInt(formData.hours) || 0;
    const minutes = parseInt(formData.minutes) ||0;
    const seconds = parseInt(formData.seconds) ||0;
    return hours * 60 + minutes + seconds/60;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const duration = calculateTotalMinutes(); 

    // Validation logic here!
    if (
      !formData.activityId ||
      duration <= 0 ||
      (formData.hours === 0 && formData.minutes === 0 && formData.seconds === 0)
    ) {
      setError("Please select an activity and enter a valid duration.");
      return;
    }

    setError("");

    const workout = {
      activityId: formData.activityId,
      duration,
      intensity: formData.intensity,
      distance: formData.distance,
      date: formData.date,
      notes: formData.notes
    };

    addWorkout(workout);
    setFormData({
      activityId: '',
      hours: 0,
      minutes: 0,
      seconds: 0,
      intensity: 'moderate',
      distance: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow" aria-label="Log Workout Form">
      <h3 className="form-title">Log Workout</h3>
      {error && <p className="error-message" role="alert">{error}</p>}
      <fieldset className="form-grid">

        <section className="form-group">
          <label className="form-label">Activity</label>
          <select
            name="activityId"
            value={formData.activityId}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select an activity</option>
            {workoutData.map(activity => (
              <option key={activity.id} value={activity.id}>
                {activity.name} ({activity.category})
              </option>
            ))}
          </select>
        </section>
        
        <section className="form-group">
          <label className="form-label">Duration</label>
          <section className="duration-inputs">
            <section className="time-input">
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleTimeChange}
                min="0"
                className="time-field"
              />
              <span className="time-label">hours</span>
            </section>
            <section className="time-input">
              <input
                type="number"
                name="minutes"
                value={formData.minutes}
                onChange={handleTimeChange}
                min="0"
                max="59"
                className="time-field"
              />
              <span className="time-label">min</span>
            </section>
            <section className="time-input">
              <input
                type="number"
                name="seconds"
                value={formData.seconds}
                onChange={handleTimeChange}
                min="0"
                max="59"
                className="time-field"
              />
              <span className="time-label">sec</span>
            </section>
          </section>
        </section>
        
        <section className="form-group">
          <label className="form-label">Intensity</label>
          <select
            name="intensity"
            value={formData.intensity}
            onChange={handleChange}
            className="form-select"
          >
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="intense">Intense</option>
          </select>
        </section>
        
        {showDistanceField && (
          <section className="form-group">
            <label className="form-label">Distance (km)</label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="form-input"
            />
          </section>
        )}
        
        <section className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
          />
        </section>
        
        <section className="form-group">
          <label className="form-label">Notes</label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes"
            className="form-input"
          />
        </section>
        
      </fieldset>
      
      <button
        type="submit"
        className="submit-button"
      >
        Log Workout
      </button>
    </form>
  );
};

export default WorkoutForm;