import React from "react";

const ProgressHistoryTable = ({ entries, selectedDate, calculateChange }) => (
  <section className="progress-card history-card" aria-label="Progress History">
    <header>
    <h2 className="card-title">Progress History</h2>
    </header>

    {entries.length > 0 ? (
      <section className="progress-table-container" role="region" aria-label="Progress History Table">
        <table className="progress-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight (kg)</th>
              <th>Body Fat %</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const { weightChange, bodyFatChange } = calculateChange(index);
              return (
                <tr key={entry.id} className={entry.date === selectedDate ? 'selected-row' : ''}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.weight}</td>
                  <td>{entry.bodyFat || '-'}</td>
                  <td className="change-cell">
                    {weightChange !== null && (
                      <span className={`change-value ${Number(weightChange) < 0 ? 'decrease' : Number(weightChange) > 0 ? 'increase' : ''}`}>
                        {weightChange > 0 ? '+' : ''}{weightChange} kg
                      </span>
                    )}
                    {bodyFatChange !== null && (
                      <span className={`change-value ${Number(bodyFatChange) < 0 ? 'decrease' : Number(bodyFatChange) > 0 ? 'increase' : ''}`}>
                        {bodyFatChange > 0 ? '+' : ''}{bodyFatChange}% bf
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    ) : (
      <p className="no-data-message">No measurements recorded yet</p>
    )}
  </section>
);

export default ProgressHistoryTable;