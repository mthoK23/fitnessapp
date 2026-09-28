import React, {useContext} from 'react';
import { AppContext } from '../user/AppContext';
import './WorkoutCard.css';


const kmToMiles= km => (km * 0.621371).toFixed(2);
const kgToLbs = kg => (kg * 2.20462).toFixed(2);

const WorkoutCard = ({ workout, onDelete }) =>{
const {unit} = useContext(AppContext);
  
 const getIntensityClass=(intensity) => {
    switch (intensity) {
      case 'Low':
        return 'intensity-light';
      case 'Medium':
        return 'intensity-moderate';
      case 'High':
        return 'intensity-intense';
      default:
        return '';
    }
  };

    return(
    <article
      className="workout-card"
      aria-label={`Workout: ${workout.activityName}, ${workout.category || ''}, ${workout.intensity || ''}`}
    >
      <section className="workout-content">
        <header className="workout-header" aria-label="Workout Header">
          <h3 className="workout-title">{workout.activityName}</h3>
          {workout.category && (
            <span className="workout-category" aria-label={`Category: ${workout.category}`}>{workout.category}</span>
          )}
          {workout.intensity && (
            <span
              className={`workout-intensity ${getIntensityClass(workout.intensity)}`}
              aria-label={`Intensity: ${workout.intensity}`}
            >
              {workout.intensity}
            </span>
          )}
        </header>
        <section className="workout-info" aria-label="Workout Details">
          <p className="workout-duration">{workout.duration} minutes</p>
          {workout.distance && (
            <p className="workout-distance">
              {unit === "imperial"
                ? `${kmToMiles(workout.distance)} mi`
                : `${workout.distance} km`}
            </p>
          )}
          {workout.weight && (
            <p className="workout-weight">
              {unit === "imperial"
                ? `${kgToLbs(workout.weight)} lbs`
                : `${workout.weight} kg`}
            </p>
          )}
          {workout.pace && (
            <p className="workout-pace">Pace: {workout.pace}</p>
          )}
          {workout.notes && (
            <p className="workout-notes">{workout.notes}</p>
          )}
        </section>
        <section className="workout-stats" aria-label="Workout Stats">
          <p className="workout-calories">
            {workout.caloriesBurned} kcal burned
          </p>
          {onDelete && (
            <button
              onClick={e=>{
                e.stopPropagation();
                onDelete(workout.id);
              
              }}
              className="workout-delete-btn" aria-label={`Delete workout: ${workout.activityName}`}
            >
              Delete
            </button>
          )}
        </section>
      </section>
    </article>
    );
};

export default WorkoutCard;