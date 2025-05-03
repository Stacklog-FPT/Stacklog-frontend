import React from "react";
import "./Calendar.scss";

const Calendar = () => {
  const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "long" }),
        fullDate: date,
      });
    }

    return days;
  };

  const weekDates = getCurrentWeekDates();
  const days = weekDates.map((d) => d.dayName);
  const dates = weekDates.map((d) => d.dayNumber);
  const displayMonth = `${
    weekDates[3].month
  } ${weekDates[3].fullDate.getFullYear()}`;

  const activeCells = [
    { day: 0, hour: 1 },
    { day: 0, hour: 14 },
    { day: 1, hour: 1 },
    { day: 2, hour: 1 },
    { day: 3, hour: 12 },
    { day: 3, hour: 4 },
    { day: 4, hour: 3 },
    { day: 6, hour: 2 },
    { day: 6, hour: 1 },
  ];

  const uniqueHours = [...new Set(activeCells.map((cell) => cell.hour))].sort(
    (a, b) => a - b
  );

  const formatHour = (h) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const period = h < 12 ? "AM" : "PM";
    return `${hour} ${period}`;
  };

  const isActive = (dayIdx, hourIdx) =>
    activeCells.find((cell) => cell.day === dayIdx && cell.hour === hourIdx);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="today-btn" onClick={() => window.location.reload()}>
          Today
        </button>
        <span>{displayMonth}</span>
      </div>

      <div className="calendar-grid">
        <div className="day-group-container">
          {weekDates.map((day, i) => (
            <div key={i} className="day-group">
              <div className="day-label">{day.dayName}</div>
              <div className="date-label">{day.dayNumber}</div>
            </div>
          ))}
        </div>

        {uniqueHours.map((hour, hourIdx) => (
          <div key={hourIdx} className="calendar-row">
            <div className="time-label">{formatHour(hour)}</div>
            {days.map((_, dayIdx) => {
              const cell = isActive(dayIdx, hour);
              return (
                <div
                  key={dayIdx}
                  className={`calendar-cell ${cell ? "active" : ""}`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
