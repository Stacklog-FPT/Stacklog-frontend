import React, { useEffect, useState } from "react";
import TimeSlot from "../TimeSlot/TimeSlot";
import ScheduleDetailCard from "../ScheduleDetailCard/ScheduleDetailCard";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import "./Calendar.scss";
import AddScheduleForms from "../AddScheduleForm/AddScheduleForm";
import axios from "axios";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleMap, setScheduleMap] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [addFormSlot, setAddFormSlot] = useState(null);
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 1} AM`);
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
  );

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleGetSchedule = async () => {
    try {
      const response = await axios.get("http://localhost:3000/schedules");
      if (response && Array.isArray(response.data)) {
        console.log(response);
        const mergedSchedule = {};

        response.data.forEach((item) => {
          Object.keys(item).forEach((key) => {
            if (key === "id") return;

            if (!Array.isArray(item[key])) {
              console.warn(`Giá trị tại ${key} không phải mảng:`, item[key]);
              return;
            }

            if (!mergedSchedule[key]) {
              mergedSchedule[key] = [];
            }

            mergedSchedule[key] = [
              ...new Set([...mergedSchedule[key], ...item[key]]),
            ];
          });
        });

        setScheduleMap(mergedSchedule);
      }
    } catch (e) {
      console.error(e.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    handleGetSchedule();
  }, []);

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

      <div className="calendar__body">
        {hours.map((hour, rowIdx) => {
          const hourKey = String(rowIdx + 1).padStart(2, "0");

          return (
            <div className="calendar__row" key={rowIdx}>
              <div className="calendar__time">{hour}</div>
              {days.map((day, colIdx) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const isActive = scheduleMap[dateKey]?.includes(hourKey);
                return (
                  <div className="calendar__cell" key={colIdx}>
                    <TimeSlot
                      isActive={isActive}
                      onClick={() =>
                        isActive
                          ? setSelectedSlot({ date: dateKey, hour: hourKey })
                          : setAddFormSlot({ date: dateKey, hour: hourKey })
                      }
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <ScheduleDetailCard
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {addFormSlot && (
        <AddScheduleForms
          slot={addFormSlot}
          onClose={() => setAddFormSlot(null)}
          onAdded={handleGetSchedule}
        />
      )}
    </div>
  );
};

export default Calendar;
