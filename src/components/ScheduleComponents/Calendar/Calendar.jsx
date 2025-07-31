import { useEffect, useState } from "react";
import { format, addHours } from "date-fns";
import "./Calendar.scss";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewWeek, createViewMonthGrid } from "@schedule-x/calendar";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import ScheduleService from "../../../service/ScheduleService";
import { useAuth } from "../../../context/AuthProvider";
import "@schedule-x/theme-default/dist/calendar.css";
import { ClockLoader } from "react-spinners";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const { getScheduleByUser } = ScheduleService();
  const { user } = useAuth();

  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    events,
    selectedDate: format(currentDate, "yyyy-MM-dd"), 
    defaultView: "month",
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  const formatDateTime = (date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error("Invalid date");
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return null;
    }
  };

  const handleGetSchedule = async () => {
    if (!user?.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calendar:", calendar);
      const response = await getScheduleByUser(user.token);
      if (response && Array.isArray(response.data)) {
        console.log(response.data);
        const formattedEvents = response.data
          .map((event) => {
            const start = new Date(event.slotStarTime);
            if (isNaN(start.getTime())) {
              console.error("Invalid slotStartTime:", event.slotStarTime);
              return null;
            }
            const end = addHours(start, 1);
            const formattedStart = formatDateTime(start);
            const formattedEnd = formatDateTime(end);
            if (!formattedStart || !formattedEnd) {
              return null;
            }
            return {
              id: event.slotId,
              title: event.slotTitle,
              start: formattedStart,
              end: formattedEnd,
            };
          })
          .filter((event) => event !== null);

        console.log("Formatted Events:", formattedEvents);
        setEvents(formattedEvents);

        if (formattedEvents.length > 0) {
          const sorted = [...formattedEvents].sort(
            (a, b) => new Date(a.start) - new Date(b.start)
          );
          const earliestDate = new Date(sorted[0].start);
          if (!isNaN(earliestDate.getTime())) {
            setCurrentDate(earliestDate); 
          } else {
            console.error("Invalid earliest date:", sorted[0].start);
          }
        }
      }
    } catch (error) {
      console.error("Failed to get schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      handleGetSchedule();
    }
  }, [user]);

  return (
    <>
      <div className={`spinner-overlay ${isLoading ? "open" : ""}`}>
        <ClockLoader
          loading={isLoading}
          size={200}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
      <div className="calendar">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>
    </>
  );
};

export default Calendar;
