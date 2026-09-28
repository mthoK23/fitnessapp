import React, { useState } from 'react';
import './Calender.css';

const Calender = ({
  selectedDate,
  onChange,
  markedDates = {},
  markType = "workouts",
  getDayInfo
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [hoveredDay, setHoveredDay] = useState(null);

  // Always start week on Sunday
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get all days to display in the calendar grid (6 rows, 7 columns)
  const getMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
   
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Find the first day to display (may be from previous month)
    const startDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthDays = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    const days = [];
    // Leading days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date: dateStr,
        isCurrentMonth: false,
        isMarked: !!markedDates[dateStr],
        isSelected: dateStr === selectedDate,
        dayInfo: getDayInfo ? getDayInfo(dateStr) : markedDates[dateStr]
      });
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        isMarked: !!markedDates[dateStr],
        isSelected: dateStr === selectedDate,
        dayInfo: getDayInfo ? getDayInfo(dateStr) : markedDates[dateStr]
      });
    }
    // Trailing days from next month
    const totalCells = 42;
    const trailing = totalCells - days.length;
    const nextMonth = (month + 1) % 12;
    const nextMonthYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= trailing; i++) {
      const dateStr = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date: dateStr,
        isCurrentMonth: false,
        isMarked: !!markedDates[dateStr],
        isSelected: dateStr === selectedDate,
        dayInfo: getDayInfo ? getDayInfo(dateStr) : markedDates[dateStr]
      });
    }
    return days;
  };

  const days = getMonthGrid(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date, isCurrentMonth) => {
    if (isCurrentMonth && typeof date === 'string') {
      onChange(date);
    }
  };

  

  return (
    <nav className="calendar-center-wrapper" aria-label="Workout Calendar">
      <section className="calendar dot-calendar" aria-label="Month View">
        <header className="calendar-header">
          <button className="month-nav" onClick={handlePrevMonth} aria-label="Previous Month">←</button>
          <h3 className="current-month" aria-live="polite">
            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <button className="month-nav" onClick={handleNextMonth}>→</button>
        </header>
        <table className="calendar-grid" role="grid" aria-label="Calendar Days">
          {weekdays.map(day => (
            <th key={day} className="weekday">{day}</th>
          ))}
          {days.map((day, idx) => (
            <tr
              key={idx}
              className={`calendar-day-dot 
                ${day.isCurrentMonth ? '' : 'other-month'}
                ${day.isSelected ? 'selected' : ''}
                ${day.isMarked ? 'has-mark' : ''}`}
              onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
              onMouseEnter={() => setHoveredDay(idx)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span
  className={
    `dot ${
      day.dayInfo?.scheduled
        ? 'dot-scheduled'
        : day.isMarked
        ? 'dot-marked'
        : 'dot-unmarked'
    }`
  }
  aria-label={day.isCurrentMonth ? `Day ${day.day}` : undefined}
/>
              {/* Tooltip on hover */}
              {hoveredDay === idx && (
                <section className="calendar-tooltip">
                  <section>
                    <strong>
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </strong>
                  </section>
                  {day.dayInfo && (
                    <section className="calendar-tooltip-info">
                      {day.dayInfo.info || `${day.dayInfo.count || 0} ${markType}`}
                    </section>
                  )}
                </section>
              )}
            </tr>
          ))}
        </table>
      </section>
    </nav>
  );
};

export default Calender;