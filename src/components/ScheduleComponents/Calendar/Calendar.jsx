import React, { useState } from "react";
import TimeSlot from "../TimeSlot/TimeSlot";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import "./Calendar.scss";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const hours = Array.from({ length: 12 }, (_, i) => `${i + 1} AM`);
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
  );

  const scheduleData = {
    "2025-07-22": ["01", "02"],
    "2025-07-23": ["03", "04"],
    "2025-07-24": ["05", "06"],
    "2025-07-25": ["07", "08", "09"],
    "2025-07-26": ["10"],
    "2025-07-27": ["11", "12"],
    "2025-07-28": ["01", "02"],
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="calendar">
      <div className="calendar__navigation">
        <button onClick={() => setCurrentDate(subDays(currentDate, 1))}>
          &lt;
        </button>
        <button onClick={() => setCurrentDate(new Date())}>Today</button>
        <button onClick={() => setCurrentDate(addDays(currentDate, 1))}>
          &gt;
        </button>
        <span>{format(currentDate, "MMMM yyyy")}</span>
      </div>

      {/* DAY HEADERS */}
      <div className="calendar__header">
        <div className="calendar__header--empty"></div>
        {days.map((day, index) => {
          const isSelectedDay = isSameDay(day, currentDate);

          return (
            <div className="calendar__header--day" key={index}>
              <div className="calendar__weekday">{format(day, "EEE")}</div>
              <div
                className={`calendar__day-number ${
                  isSelectedDay ? "calendar__day--today" : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIME SLOTS */}
      <div className="calendar__body">
        {hours.map((hour, rowIdx) => (
          <div className="calendar__row" key={rowIdx}>
            <div className="calendar__time">{hour}</div>
            {days.map((day, colIdx) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const hourKey = String(rowIdx + 1).padStart(2, "0");
              const isActive = scheduleData[dateKey]?.includes(hourKey);
              return (
                <div className="calendar__cell" key={colIdx}>
                  <TimeSlot isActive={isActive} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
