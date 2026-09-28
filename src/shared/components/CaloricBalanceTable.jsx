import React from "react";


const CaloricBalanceTable = ({ entries, getCaloricBalanceForDate }) => (
  <section className="progress-card summary-card">
    <header>
    <h2 className="card-title">Caloric Balance</h2>
    </header>
    <section className="progress-table-container">
      <table className="progress-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Calories In</th>
            <th>Calories Burned</th>
            <th>Net Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 7).map(entry => {
            const balance = getCaloricBalanceForDate(entry.date);
            return (
              <tr key={`balance-${entry.id}`}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{balance.consumed} kcal</td>
                <td>{balance.burned} kcal</td>
                <td>
                  <span className={balance.net < 0 ? 'decrease' : 'increase'}>
                    {balance.net} kcal
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  </section>
);

export default CaloricBalanceTable;