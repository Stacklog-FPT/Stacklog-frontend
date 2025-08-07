import { useEffect, useState } from "react";
import {
  Calendar as RBCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ScheduleService from "../../../service/ScheduleService";
import { useAuth } from "../../../context/AuthProvider";
import { addHours } from "date-fns";
import Modal from "./SlotModal";
import "./Calendar.scss";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const { updateScheduleSlot, deleteScheduleSlot } = ScheduleService();

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(RBCalendar);

export default function CustomCalendar() {
  const { getScheduleByUser, deleteScheduleSlot } = ScheduleService();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await getScheduleByUser(user?.token);
      if (res?.data) {
        const formatted = res.data.map((e) => ({
          id: e.slotId,
          title: e.slotTitle,
          start: new Date(e.slotStarTime),
          end: addHours(new Date(e.slotStarTime), 1),
        }));
        setEvents(formatted);
      }
    } catch (err) {
      console.error("❌ Lỗi khi load lịch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const moveEvent = async ({ event, start, end }) => {
    const now = new Date();

    if (start < now) {
      alert("⛔ Không thể di chuyển sự kiện về quá khứ!");
      return;
    }

    try {
      const updatedEvent = {
        ...event,
        start,
        end,
      };

      const payload = {
        slotId: updatedEvent.id,
        slotTitle: updatedEvent.title,
        slotDescription: updatedEvent.description || "",
        slotStarTime: new Date(start).toISOString(),
        groupId: updatedEvent.groupId || "",
        userIdAssigns: updatedEvent.userIdAssigns || [],
      };

      await updateScheduleSlot(user.token, payload);

      const updatedEvents = events.map((e) =>
        e.id === event.id ? { ...e, start, end } : e
      );
      setEvents(updatedEvents);

      console.log("✅ Đã cập nhật sự kiện:", payload);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sự kiện:", error);
    }
  };

  const handleUpdate = async (updatedEvent) => {
    try {
      const payload = {
        slotId: updatedEvent.id,
        slotTitle: updatedEvent.title,
        slotDescription: updatedEvent.description || "",
        slotStarTime: new Date(updatedEvent.start).toISOString(),
        groupId: updatedEvent.groupId || "",
        userIdAssigns: updatedEvent.userIdAssigns || [],
      };

      await updateScheduleSlot(user?.token, payload);

      const updatedEvents = events.map((e) =>
        e.id === updatedEvent.id ? updatedEvent : e
      );
      setEvents(updatedEvents);
      console.log("✅ Đã cập nhật slot:", payload);
    } catch (err) {
      console.error("❌ Lỗi khi update slot:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      window.confirm("Bạn có chắc chắn muốn xóa slot này?");
      await deleteScheduleSlot(user?.token, id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSelectedEvent(null);
    } catch (err) {
      console.error("❌ Xóa thất bại:", err);
    }
  };

  useEffect(() => {
    if (user?.token) fetchEvents();
  }, [user]);

  return (
    <div className="calendar-wrapper">
      {isLoading && <div className="loading-overlay">Đang tải...</div>}
      <DndProvider backend={HTML5Backend}>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "80vh" }}
          onSelectEvent={(event) => setSelectedEvent(event)}
          draggableAccessor={() => true}
          onEventDrop={moveEvent}
          resizable
          onEventResize={moveEvent}
        />
      </DndProvider>

      {selectedEvent && (
        <Modal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => handleDelete(selectedEvent.id)}
          onEdit={() => alert(`Bạn muốn sửa: ${selectedEvent.title}`)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
