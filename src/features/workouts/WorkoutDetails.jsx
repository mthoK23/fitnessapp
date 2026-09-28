import React, {useContext} from "react";
import {useParams} from "react-router-dom"; 
import {AppContext} from "../user/AppContext";


function WorkoutDetails(){
    const {id} = useParams();
    const {workouts}= useContext(AppContext);

    const workout = workouts.find(w => String(w.id) === String(id));
    if (!workout) {
        return <p>Workout not found</p>;
    }

    return(
        <main>
        <section className="workout-details">
        <h2>{workout.activityName || workout.name || "Workout"}</h2>
        <p>Category:{workout.category || "N/A"}</p>
        <p>Duration: {workout.duration ? `${workout.duration} min` : "N/A"}</p>
        <p>Calories Burned: {workout.caloriesBurned ? `${workout.caloriesBurned} kcal` : "N/A"}</p>
        <p>Intensity:{workout.intensity || "N/A"}</p>
        </section>
        </main>
    );
}

export default WorkoutDetails;