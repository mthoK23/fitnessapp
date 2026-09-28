import React, { useState } from "react";

const ScheduleWorkoutForm = ({ onSave, onClose }) => {
  const [form, setForm] = useState({
    date: "",
    type: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
    setForm({ date: "", type: "" });
    onClose();
  };

  return (
    <div className="workout-form-modal" role="dialog" aria-modal="true" aria-labelledby="Schedule Workout Modal">
      <section className="workout-form-modal-bg" onClick={onClose} />
      <section className="workout-form-modal-content">
        <h2>Schedule a Workout</h2>
        <form onSubmit={handleSubmit}>
          <section className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </section>
          <section className="form-group">
            <label className="form-label">Workout Type</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="form-input"
              required
            />
          </section>
          <button type="submit" className="submit-button">Save Schedule</button>
        </form>
        <button className="close-form-btn" onClick={onClose}>Close</button>
      </section>
    </div>
  );
};

export default ScheduleWorkoutForm;