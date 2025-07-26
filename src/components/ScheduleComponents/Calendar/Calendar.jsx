import React, { useState } from "react";
import TimeSlot from "../TimeSlot/TimeSlot";
import ScheduleDetailCard from "../ScheduleDetailCard/ScheduleDetailCard";
import { format, addDays } from "date-fns";
import "./Calendar.scss";

const Calendar = () => {
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 1} AM`);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));

  const scheduleData = {
    "2025-07-22": ["01", "02"],
    "2025-07-23": ["03", "04"],
    "2025-07-24": ["05", "06"],
    "2025-07-25": ["07", "08", "09"],
    "2025-07-26": ["10"],
    "2025-07-27": ["11", "12"],
    "2025-07-28": ["01", "02"],
  };

  const [selectedSlot, setSelectedSlot] = useState(null);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__header--empty"></div>
        {days.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <div className="calendar__header--day" key={index}>
              <div className="calendar__weekday">{format(day, "EEE")}</div>
              <div
                className={`calendar__day-number ${
                  isToday ? "calendar__day--today" : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar__body">
        {hours.map((hour, rowIdx) => (
          <div className="calendar__row" key={rowIdx}>
            <div className="calendar__time">{hour}</div>
            {days.map((day, colIdx) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const hourKey = String(rowIdx + 1).padStart(2, "0");
              const isActive = scheduleData[dateKey]?.includes(hourKey);
              return (
                <div
                  className="calendar__cell"
                  key={colIdx}
                  onClick={() => {
                    if (isActive) {
                      setSelectedSlot({
                        date: dateKey,
                        hour: hour,
                        hourKey: hourKey,
                        isActive,
                      });
                    }
                  }}
                  style={{ cursor: isActive ? "pointer" : "default" }}
                >
                  <TimeSlot isActive={isActive} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Hiển thị card chi tiết nếu đã chọn slot */}
      {selectedSlot && (
        <ScheduleDetailCard
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default Calendar;