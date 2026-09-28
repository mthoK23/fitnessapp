import React, {useState, useContext, useEffect} from "react";
import { AppContext } from '../user/AppContext';
import workoutData from '../workouts/workoutData';

const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);

function UserProfileForm() {
    const {userProfile, setUserProfile, progressData, addProgressEntry, unit } = useContext(AppContext);
    const [form, setForm] = useState(userProfile);

    useEffect(() => {
        setForm(userProfile);

    }, [userProfile]);
    
    

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});

    };

    const handleSubmit = (e) =>{
        e.preventDefault();
        setUserProfile(form);
   

    // Only add a progress entry if there are none yet
    if (
        progressData.length === 0 && 
        form.initialWeight && 
        !isNaN(Number(form.initialWeight))
    ){
        addProgressEntry({
            id: Date.now().toString(), 
            date: new Date().toISOString().split('T')[0],
            weight: Number(form.initialWeight),
            bodyFat:form.bodyFat || "",
        });
    }
    };

return(
    <main className="progress-card user-profile-card" aria-label="User Profile Form">
        <h2 className="card-title">Baseline Stats 💪🏻</h2>
        <form onSubmit={handleSubmit} className="user-profile-form">

            <section className="form-group">
                <label className="form-label">
                  Weight ({unit === "imperial" ? "lbs" : "kg"})
                </label>
                <input
                  type="number"
                  name="initialWeight"
                  value={unit === "imperial" ? kgToLbs(form.initialWeight) : form.initialWeight}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.1"
                  required
                />
            </section>

            <section className ="form-group">
                <label className="form-label">Height(CM)</label>
                <input 
                type="number"
                name="height"
                value={form.height || ""}
                onChange= {handleChange}
                className="form-input"
                min="0"
                required
                />
            </section>

            <section className ="form-group">
                <label className="form-label">Age</label>
                <input
                 type="number"
                name="age"
                value={form.age || ""}
                onChange= {handleChange}
                className="form-input"
                min="0"
                required
                />
            </section>

            <section className="form-group">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            value={form.gender || ""}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </section>

        <section className="form-group">
            <label className ="form-label">Daily Exercise Goal (Minutes)</label>
            <input 
            type="number"
            name="dailyExerciseGoalMinutes"
            value={form.dailyExerciseGoalMinutes ||""}
            onChange={handleChange}
            className="form-input"
            min="1"
            step="1"
            required
            />
        </section>

        <section className="form-group">
            <label className="form-label">Calories Burned Per Minute(estimate)</label>
            <input 
            type="number"
            name="caloriesPerMinute"
            value={form.caloriesPerMinute ||""}
            onChange={handleChange}
            className="form-input"
            min="1"
            step="1"
            required
            />
        </section>

        <button type="submit" className="submit-button">
            Update Profile
        </button>
        </form>

    </main>

);
}

export default UserProfileForm;