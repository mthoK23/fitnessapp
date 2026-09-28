import React, { createContext, useState, useEffect, useContext } from 'react';
import workoutData from '../workouts/workoutData';
import { AuthContext } from './AuthContext';        
import { Badges } from '../badges/badgesData';


export const AppContext = createContext();

export const AppProvider = ({children}) => {
    const { currentUser, isAuthenticated } = useContext(AuthContext);
    

    const userId = currentUser?.id || 'guest';
    
    const [meals, setMeals] = useState(() => {
        if (!isAuthenticated) return [];
        const savedMeals = localStorage.getItem(`meals_${userId}`);
        return savedMeals ? JSON.parse(savedMeals) : [];
    });
    
    const [workouts, setWorkouts] = useState(() => {
        if (!isAuthenticated) return [];
        const savedWorkouts = localStorage.getItem(`workouts_${userId}`);
        return savedWorkouts ? JSON.parse(savedWorkouts) : [];
    });
    
    const [progressData, setProgressData] = useState(() => {
        if (!isAuthenticated) return [];
        const savedData = localStorage.getItem(`progressData_${userId}`);
        return savedData ? JSON.parse(savedData) : [];
    });
// User profile state   
const [userProfile, setUserProfile] = useState({});

useEffect(()=>{
   if (isAuthenticated) {
    const savedProfile = localStorage.getItem(`userProfile_${userId}`);
    let profile = savedProfile ? JSON.parse(savedProfile) : {};
    if (!profile.badges) profile.badges = [];
    setUserProfile(profile);
   }else{
    setUserProfile({});
   }
}, [userId, isAuthenticated]);

//Badges helper 
    const awardBadge = (badgeId) => {
        setUserProfile(profile=>{
            if (profile.badges?.includes(badgeId)) return profile;
        const updated = { ...profile, badges: [...(profile.badges || []), badgeId] };
        localStorage.setItem(`userProfile_${userId}`, JSON.stringify(updated));
        return updated;
        });

    };

// Save user profile to localStorage whenever it changes
    useEffect(() => {
        if (isAuthenticated){
            localStorage.setItem(`userProfile_${userId}`,JSON.stringify(userProfile));
        }
    }, [userProfile, userId, isAuthenticated]);


    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isAuthenticated) {
            const savedMeals = localStorage.getItem(`meals_${userId}`);
            if (savedMeals) setMeals(JSON.parse(savedMeals));
           else setMeals([]);

           const savedWorkouts = localStorage.getItem(`workouts_${userId}`);
           if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
           else setWorkouts([]);

           const savedProgress = localStorage.getItem(`progressData_${userId}`);
           if (savedProgress) setProgressData(JSON.parse(savedProgress));
           else setProgressData([]);
        }else{
            setMeals([]);
            setWorkouts([]);
            setProgressData([]);
        }
        }, [userId, isAuthenticated]);
//Saving meals
    useEffect(()=> {
        if (isAuthenticated){
            localStorage.setItem(`meals_${userId}`, JSON.stringify(meals)); 

        }
    }, [meals, userId, isAuthenticated ]);

    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem(`workouts_${userId}`, JSON.stringify(workouts));
        }
    }, [workouts, userId, isAuthenticated]);

    //Awarding Sign-Up badge
    useEffect(() => {
  if (isAuthenticated && currentUser && userProfile && userProfile.badges && !userProfile.badges.includes("signup")) {
    awardBadge("signup");
  }
}, [isAuthenticated, currentUser]);


//saving progressData
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem(`progressData_${userId}`, JSON.stringify(progressData));
        }
    }, [progressData, userId, isAuthenticated]);

    const addMeal = (meal) => {
        const newMeal = {
            ...meal,
            id: Date.now().toString(),
            date: meal.date || new Date().toISOString().split('T')[0]
        };
         setMeals(prevMeals => {
        const updatedMeals = [...prevMeals, newMeal];
        if (updatedMeals.length === 1) awardBadge("first_meal");
        return updatedMeals;
    });
    };

    const [unit, setUnit]= useState(()=> localStorage.getItem("unit") || "metric");
    useEffect(()=>{
        localStorage.setItem("unit", unit);
    }, [unit]);

    const getMealsByDate = () => {
        const mealsByDate = {};

        meals.forEach(meal => {
            const date = meal.date;
            if (!mealsByDate[date]) {
                mealsByDate[date] = {
                    meals: [],
                    totalCalories: 0,
                    totalProtein: 0
                };
            }

            mealsByDate[date].meals.push(meal);
            mealsByDate[date].totalCalories += Number(meal.calories) || 0;
            mealsByDate[date].totalProtein += Number(meal.protein) || 0;
        });

        return mealsByDate;
    };

    //Function for calculating streak a streak
    function calculateStreak(workouts) {
    const dates = [...new Set(workouts.map(w => w.date))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let current = new Date();
    current.setHours(0,0,0,0);
    for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        date.setHours(0,0,0,0);
        if (date.getTime() === current.getTime()) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

    const addWorkout = (workout) => {
        const activityData = workoutData.find(item => item.id === workout.activityId);

        if (!activityData) return;

        const intensityMultiplier = activityData.intensityLevels[workout.intensity] || 1;
        const caloriesBurned = Math.round(
            activityData.caloriesPerMinuteBase *
            intensityMultiplier * 
            workout.duration
        );

        let pace = null;
        if (activityData.trackDistance && workout.distance > 0) {
            const paceMinutes = workout.duration / workout.distance;
            const paceMinutesWhole = Math.floor(paceMinutes);
            const paceSeconds = Math.round((paceMinutes - paceMinutesWhole) * 60);
            pace = `${paceMinutesWhole}:${paceSeconds.toString().padStart(2, '0')} min/km`;
        }

        const newWorkout = {
            ...workout,
            id: Date.now().toString(), 
            date: workout.date || new Date().toISOString().split('T')[0],
            caloriesBurned,
            pace, 
            activityName: activityData.name,
            category: activityData.category
        };

         setWorkouts(prevWorkouts => {
        const updatedWorkouts = [...prevWorkouts, newWorkout];
        // Award badge if this is the first workout
        if (updatedWorkouts.length === 1) awardBadge("first_workout");
        // Award 30-min badge if this workout is 30+ min
        if (Number(newWorkout.duration) >= 30) awardBadge("30min_exercise");
        // Award streak badge if streak is now 2+
        const streak = calculateStreak(updatedWorkouts);
        if (streak >= 2) awardBadge("streak");
        return updatedWorkouts;
    });
    };

    const getWorkoutsByDate = () => {
        const workoutsByDate = {};
        
        workouts.forEach(workout => {
            const date = workout.date;
            if (!workoutsByDate[date]) {
                workoutsByDate[date] = {
                    workouts: [],
                    totalCaloriesBurned: 0,
                    totalDuration: 0
                };
            }
            
            workoutsByDate[date].workouts.push(workout);
            workoutsByDate[date].totalCaloriesBurned += Number(workout.caloriesBurned) || 0;
            workoutsByDate[date].totalDuration += Number(workout.duration) || 0;
        });
        
        return workoutsByDate;
    };

    const addProgressEntry = (entry) => {
        const newEntry = {
            ...entry, 
            id: Date.now().toString()
        };
        setProgressData([...progressData, newEntry]);
    };

    const getProgressByDate = () => {
        return [...progressData].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
    };

    

const deleteMeal = (mealId) => {
  setMeals(meals.filter(meal => meal.id !== mealId));
};

const deleteWorkout = (workoutId) => {
  setWorkouts(workouts.filter(workout => workout.id !== workoutId));
};

    const getCaloricBalanceForDate = (date) => {
        const mealsForDate = meals.filter(meal => meal.date === date);
        const totalCaloriesConsumed = mealsForDate.reduce(
            (sum, meal) => sum + (Number(meal.calories) || 0), 0
        );

        const workoutsForDate = workouts.filter(workout => workout.date === date);
        const totalCaloriesBurned = workoutsForDate.reduce(
            (sum, workout) => sum + (Number(workout.caloriesBurned) || 0), 0
        );

        return {
            consumed: totalCaloriesConsumed, 
            burned: totalCaloriesBurned,
            net: totalCaloriesConsumed - totalCaloriesBurned
        };
    };

    return (
        <AppContext.Provider value={{
            meals, 
            addMeal, 
            getMealsByDate,
            workouts,
            addWorkout,
            getWorkoutsByDate,
            deleteWorkout,
            workoutData,
            progressData,
            deleteMeal,
            addProgressEntry,
            getProgressByDate,
            getCaloricBalanceForDate, 
            userProfile,
            setUserProfile,
            awardBadge,
            unit,
            setUnit
        }}>
            {children}
        </AppContext.Provider>
    );
};