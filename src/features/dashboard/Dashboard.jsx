import React, { useContext , useState} from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../user/AppContext";
import { AuthContext } from "../user/AuthContext";
import ProgressRings from '../progress/ProgressRings';
import LoginModal from '../user/LoginModal';
import activityBg from './istockphoto-1324624694-612x612.jpg';
import './dashboard.css';

function Dashboard() {
  const { meals, workouts, progressData, userProfile } = useContext(AppContext);
  const { currentUser, isAuthenticated } = useContext(AuthContext);
   const [showLoginModal, setShowLoginModal] = useState(false);

  // Today's date
  const today = new Date().toISOString().split('T')[0];

  // Today's meals and calories in
  const todaysMeals = meals.filter(meal => meal.date === today);
  const caloriesIn = todaysMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);

  // Today's workouts and calories burned
  const todaysWorkouts = workouts.filter(workout => workout.date === today);
  const caloriesBurnedToday = todaysWorkouts.reduce(
    (total, workout) => total + (Number(workout.caloriesBurned) || 0), 0
  );

  // Most recent workout
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestWorkout = sortedWorkouts[0];

  // Most recent weight entry
  const sortedProgress = [...progressData].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestWeight = sortedProgress[0]?.weight;

  return (
    <main className="dashboard-container" role="main" aria-label="Dashboard Main Content">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Your Dashboard</h1>
        <p className="dashboard-tagline">
          Your journey to greatness starts here
        </p>
        <p className="dashboard-welcome">
          {isAuthenticated && currentUser
            ? `Welcome back, ${currentUser.username || "User"}!`
            : "Welcome! Please log in to experience the app."}
        </p>
      </header>

      <section className="dashboard-grid" aria-label="Dashboard Quick Stats">
        {/* Recent Weight */}
        <Link to="/progress" className="stat-card dashboard-card-left" aria-label="Go to Progress: Recent Weight">
          <h2 className="stat-title">Recent Weight</h2>
          {latestWeight ? (
            <p className="stat-value success">{latestWeight} kg</p>
          ) : (
            <p className="stat-none">No weight logged yet</p>
          )}
        </Link>

        {/* User Card */}
        {isAuthenticated && currentUser ? (
          <Link to="/profile" className="stat-card user-card" aria-label="Go to Profile">
            <section style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Avatar or Initials */}
              <section className="user-avatar">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                ) : (
                  <section className="user-initials">
                    {currentUser.username ? currentUser.username[0].toUpperCase() : "U"}
                  </section>
                )}
              </section>
              <section>
                <section className="user-name">{currentUser.username || "User"}</section>
                {userProfile?.goalWeight && (
                  <section className="user-goal">
                    Goal: <span style={{ color: "var(--color-accent-gold)" }}>{userProfile.goalWeight} kg</span>
                  </section>
                )}
              </section>
            </section>
          </Link>
        ) : (
          <section
            className="stat-card user-card"
            style={{ cursor: "pointer", opacity: 0.85 }}
            onClick={() => setShowLoginModal(true)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowLoginModal(true); }}
            aria-label="Open login or signup"
            role="button"
          >
            <section style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <section className="user-avatar">
                <section className="user-initials">U</section>
              </section>
              <section>
                <section className="user-name">User</section>
                <section className="user-goal" style={{ color: "#aaa" }}>
                  Please log in
                </section>
              </section>
            </section>
          </section>
        )}

        {/* Last Activity */}
        <Link
          to="/workouts"
          className="stat-card dashboard-card-center"
          aria-label="Go to Workouts: Last Activity"
          style={{
            backgroundImage: `linear-gradient(rgba(24,28,31,0.72), rgba(24,28,31,0.72)), url(${activityBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "var(--color-text)",
            position: "relative"
          }}
        >
          <h2 className="stat-title">Last Activity</h2>
          {latestWorkout ? (
            <section className="stat-value accent" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <span>
                <strong>{latestWorkout.activityName}</strong>
                {latestWorkout.category && (
                  <span style={{ color: "var(--color-accent-gold)", marginLeft: 8 }}>
                    ({latestWorkout.category})
                  </span>
                )}
              </span>
              <span>
                {latestWorkout.duration} min
                {latestWorkout.distance && ` · ${latestWorkout.distance} km`}
              </span>
              {latestWorkout.intensity && (
                <span style={{ color: "var(--color-action-orange)" }}>
                  Intensity: {latestWorkout.intensity}
                </span>
              )}
              {latestWorkout.notes && (
                <span style={{ color: "var(--color-text)", opacity: 0.7 }}>
                  Notes: {latestWorkout.notes}
                </span>
              )}
            </section>
          ) : (
            <p className="stat-none">No workouts logged yet</p>
          )}
        </Link>

        {/* Calories Burned Today */}
        <Link to="/workouts" className="stat-card dashboard-card-right" aria-label="Go to Workouts: Calories Burned Today">
          <h2 className="stat-title">Calories Burned Today</h2>
          {caloriesBurnedToday > 0 ? (
            <p className="stat-value action">{caloriesBurnedToday} kcal</p>
          ) : (
            <p className="stat-none">No workouts today</p>
          )}
        </Link>
      </section>

      <section className="dashboard-features" aria-label="FitTrack Features">
        <h2 className="features-title">What you can do with FitTrack:</h2>
        <ul>
          <li>🍽️ Log your meals and calories</li>
          <li>🏋️ Track your workouts and routines</li>
          <li>📈 Monitor your weight and body fat</li>
          <li>🎯 Visualize your progress and stay motivated</li>
        </ul>
      </section>

      <p className="dashboard-cta">
        Ready to make progress?{" "}
        <Link to="/progress" className="cta-link" aria-label="Go to Progress: Log your first measurement">
          Log your first measurement!
        </Link>
      </p>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}

export default Dashboard;
