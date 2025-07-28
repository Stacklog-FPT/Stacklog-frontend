import { useEffect, useState } from "react";
import { format, addHours, parseISO } from "date-fns";
import "./Calendar.scss";
import AddScheduleForms from "../AddScheduleForm/AddScheduleForm";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewWeek, createViewMonthGrid } from "@schedule-x/calendar";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import ScheduleService from "../../../service/ScheduleService";
import { useAuth } from "../../../context/AuthProvider";
import "@schedule-x/theme-default/dist/calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getScheduleByUser } = ScheduleService();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    events,
    selectedDate: format(currentDate, "yyyy-MM-dd"),
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  const handleGetSchedule = async () => {
    try {
      const response = await getScheduleByUser(user.token);

      if (response) {
        console.log(response)
        const formattedEvents = response.data.map((event) => {
          return {
            id: event.id,
            title: event.projectName,
            start: new Date(event.slotStarTime),
            end: new Date(event.slotEndTime),
          };
        });

        setEvents(formattedEvents);

        if (formattedEvents.length > 0) {
          const nearestDate = formattedEvents
            .map((e) => new Date(e.start))
            .sort((a, b) => a - b)[0];

          setCurrentDate(nearestDate);
        }
      }
    } catch (error) {
      console.error("Failed to get schedules:", error);
    }
  };

  useEffect(() => {
    if (calendar) {
      handleGetSchedule();
    }
  }, [calendar]);

  return (
    <div className="calendar">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
};

export default Calendar;
