import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function ProgressRings({ caloriesIn, caloriesBurned, weight, weightGoal }) {
  // Ring configs
  const size = 160;
  const strokeWidths = [18, 12, 6];
  const radii = [
    size / 2 - strokeWidths[0] / 2,
    size / 2 - strokeWidths[0] - strokeWidths[1] / 2 - 4,
    size / 2 - strokeWidths[0] - strokeWidths[1] - strokeWidths[2] / 2 - 8,
  ];

  //Progress Calculations
  const caloriesInPct = Math.min(caloriesIn / 2500, 1); 
  const caloriesBurnedPct = Math.min(caloriesBurned / 800, 1); 
  const weightPct = Math.min(weight / (weightGoal || 100), 1);

  // Ring colors
  const colors = [
    "var(--color-accent-gold)",    
    "var(--color-action-orange)",  
    "var(--color-success)",        
  ];

  const values = [caloriesInPct, caloriesBurnedPct, weightPct];
  const labels = [
    `${caloriesIn} kcal in`,
    `${caloriesBurned} kcal burned`,
    `${weight} kg`,
  ];

  return (
    <section style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2rem 0" }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        {radii.map((radius, i) => {
          const circumference = 2 * Math.PI * radius;
          return (
            <g key={i}>
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#23272b"
                strokeWidth={strokeWidths[i]}
                fill="none"
              />
              {/* Progress ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors[i]}
                strokeWidth={strokeWidths[i]}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - values[i])}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s" }}
              />
            </g>
          );
        })}
      </svg>

      <section style={{ marginTop: "1.2rem", textAlign: "center" }}>
        <span style={{ color: "var(--color-accent-gold)", fontWeight: 600 }}>{labels[0]}</span>
        <span style={{ color: "var(--color-action-orange)", fontWeight: 600 }}>{labels[1]}</span>
        <span style={{ color: "var(--color-success)", fontWeight: 600 }}>{labels[2]}</span>
      </section>

    </section>
  );
}

export default ProgressRings;