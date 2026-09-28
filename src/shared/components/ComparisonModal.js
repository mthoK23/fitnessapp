import React from "react";
import "../styles/ComparisonModal.css";

const ComparisonModal=({ onClose }) => (

  <div className="comparison-modal-bg" role="dialog" aria-modal="true" aria-label="Assignment Comparison">
    <section className="comparison-modal-content">
      <header>
        <h2>🔄 Comparison: Assignment 2 vs Final App</h2>
      </header>
      <section>
        <h3>📌 Original Plan (Assignment 2)</h3>
        <ul>
          <li>App Theme: A fitness tracking Community app, that can also be used for general productivity</li>
          <li>Key Features Proposed:
            <ul>
              <li>XP & streak-based gamification</li>
              <li>Custom workout plan builder</li>
              <li>Nutrition tracking (macros, recipes, trends)</li>
              <li>Community interaction (leaderboards, achievements)</li>
              <li>Streaks, rewards, unlockables</li>
              <li>Personalization of routines and progress</li>
              <li>Accessibility & dark/light mode</li>
            </ul>
          </li>
          <li>Planned Pages: Dashboard, Nutrition, Workouts, Progress, Settings</li>
        </ul>
        <h3>✅ Final App Implementation (FitTrack)</h3>
        <strong>Final implementation, is a more simple toned down app, that instead of being a fully branded community experience, is 
                is used just for data collection. 
        </strong>
        <table>
          <thead>
            <tr>
              <th>Feature/Idea</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>🎮 Gamification ( badges, streaks)</td><td>✅</td><td>Badges unlock based on streaks, calories burned,
                         weight tracking. I scoped the total amount of achievements, down to 5 and also removed the experience points
                         system. It made sense for an integrated ecosystem app where XP points could be used as in app currency.</td></tr>
            <tr><td>🧮 Nutrition tracking</td><td>✅</td><td>The user can manually track their portion sizes, caloric intake, and also use the Spoonacular API to find 
                                                            ready-made nutrition data.</td></tr>
            <tr><td>💪 Workout tracking</td><td>✅</td><td>User can log a range of workouts, and get their caloric burn based on the workout and other factors</td></tr>
            <tr><td>📊 Progress analytics</td><td>✅</td><td>Streak calendar, daily progress and weight tracking rings. 
                                                            Also made use of tables for longer tracking </td></tr>
            <tr><td>🔍 Filtering/sorting for logs</td><td>✅</td><td>Calories burned, food type filters</td></tr>
            <tr><td>🎨 UI/UX + Style Guide</td><td>✅</td><td>Original typography and color design</td></tr>
            <tr><td>♿ Accessibility goals</td><td>✅</td><td>Semantic HTML, ARIA, keyboard nav</td></tr>
          </tbody>
        </table>
        <strong>What Changed (And Why)</strong>
        <table>
          <thead>
            <tr>
              <th>Feature/Section</th>
              <th>Change Made</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>🧱 Workout Plan Builder</td><td>❌ Cut</td><td>Too complex for current scope. Range into
                                                                    trouble with integrating a plan builder without using a pre-built 
                                                                    template, opted instead for workout logging and tracking. Also, didnt implement
                                                                    live/realtime workout tracking because of time constraints.</td></tr>
            <tr><td>🧑‍🤝‍🧑 Community Leaderboards</td><td>❌ Cut</td><td>Another idea that was too complex, removed because of overscoping. Also non critical</td></tr>
            <tr><td>🍽️ Recipe Suggestions & Trends</td><td>❌ Replaced</td><td>Used the Nutritionix API service to get meals. Instead of recipes, the user
                                                                        can just get their macronutrients for a meal and log it.</td></tr>
            <tr><td>🧭 Navigation Pages</td><td>Simplified</td><td>Removed "Settings", "Community", etc.</td></tr>
            <tr><td>🏃‍♀️ OpenStreetMap Integration</td><td>❌ Removed</td><td>Cut due to time/complexity, and wouldn't exactly make sense for a desktop app, although I did try
                                                                    to have a smaller route-planner</td></tr>
            <tr><td>🧪 Form Complexity + Saved Plans</td><td>Simplified</td><td>Meals/workouts entered ad-hoc</td></tr>
          </tbody>
        </table>
      </section>
      <button onClick={onClose} className="close-modal-btn" aria-label="Close comparison modal">Close</button>
    </section>
  </div>
);

export default ComparisonModal;