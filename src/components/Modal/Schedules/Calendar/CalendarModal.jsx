import { useEffect, useState, useMemo } from "react";
import {
  Calendar as RBCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "./calendarModal.scss";
import Modal from "./SlotModal";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  getScheduleByGroupId,
  deleteScheduleSlot,
  updateScheduleSlot,
} from "../../../../service/ScheduleService";
import { useAuth } from "../../../../context/AuthProvider";
import { addHours } from "date-fns";
import { Toaster, toast } from "sonner";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import decodeToken from "../../../../service/DecodeJwt";
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(RBCalendar);

export default function Calendar({ groupId, isPage }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { schedules, pending } = useSelector((s) => s.schedule);
  const [selectedEvent, setSelectedEvent] = useState(null);
  let myId = null;
  try {
    myId = user?.token ? decodeToken(user.token).id : null;
  } catch (e) {
    myId = null;
  }
  const showingSchedule = () => {
    let scheduleList = [];

    if (isPage) {
      scheduleList = schedules.filter((s) =>
        s.assignTo?.includes(decodeToken(user.token).id)
      );
    } else {
      scheduleList = schedules.filter((s) => s.groupId?.includes(groupId));
    }

    return scheduleList;
  };

  const events = useMemo(() => {
    if (!Array.isArray(showingSchedule())) return [];
    return showingSchedule().map((e) => {
      const id = e.slotId ?? e.id;
      const title = e.slotTitle ?? e.slotTittle ?? e.title ?? "No title";
      const startISO = e.slotStartTime ?? e.slotStarTime ?? e.start;

      const parseAsLocal = (iso) => {
        if (!iso) return null;

        if (iso instanceof Date) return iso;

        const m = iso.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
        );
        if (m) {
          const [, Y, Mo, D, H, Mi, S] = m;
          return new Date(
            Number(Y),
            Number(Mo) - 1,
            Number(D),
            Number(H),
            Number(Mi),
            Number(S || 0)
          );
        }

        return new Date(iso);
      };

      const start = parseAsLocal(startISO) || new Date();
      const end = e.end
        ? parseAsLocal(e.end) || addHours(start, 1)
        : addHours(start, 1);
      return { id, title, start, end, groupId: e.groupId, ...e };
    });
  }, [schedules]);

  const formatLocalDateTime = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const hh = String(dt.getHours()).padStart(2, "0");
    const mi = String(dt.getMinutes()).padStart(2, "0");
    const ss = String(dt.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  };

  const moveEvent = async ({ event, start, end }) => {
    const now = new Date();

    if (start < now) {
      toast.error("Cannot move events to the past");
      return;
    }

    const updatedEvent = {
      ...event,
      start,
      end,
    };

    const payload = {
      slotId: updatedEvent.id,
      slotTitle: updatedEvent.title,
      slotDescription: updatedEvent.description || "",
      slotStartTime: formatLocalDateTime(updatedEvent.start),
      groupId: updatedEvent.groupId || [],
      userIdAssigns: updatedEvent.userIdAssigns || updatedEvent.assignTo || [],
    };

    await updateScheduleSlot(user.token, payload.slotId, payload, dispatch);
    toast.success("Change time successfully!");
  };

  const handleUpdate = async (updatedEvent) => {
    try {
      const payload = {
        slotId: updatedEvent.id,
        slotTitle: updatedEvent.title,
        slotDescription: updatedEvent.description || "",
        slotStartTime: formatLocalDateTime(updatedEvent.start),
        groupId: updatedEvent.groupId || "",
        userIdAssigns:
          updatedEvent.userIdAssigns || updatedEvent.assignTo || [],
      };

      await updateScheduleSlot(user.token, payload.slotId, payload, dispatch);
      toast.success("Updated slot successfully!");
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDelete = async (id, createdBy) => {
    const myIdStr = myId ? String(myId) : null;
    const createdByStr = createdBy ? String(createdBy) : null;
    if (!myIdStr || !createdByStr || myIdStr !== createdByStr) {
      toast.error("Only the creator of this slot can delete it");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure to delete this task?",
      text: "This action can't completed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await deleteScheduleSlot(user?.token, id, dispatch);
      setSelectedEvent(null);
      toast.success("Delete slot successfully!");
    }
  };

  useEffect(() => {
    getScheduleByGroupId(user.token, groupId, dispatch);
  }, [groupId]);

  return (
    <div className="calendar-wrapper">
      <Toaster position="bottom-right" richColors closeButton />
      {pending && <div className="loading-overlay">Waiting for minutes...</div>}
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
          onDelete={() =>
            handleDelete(selectedEvent.id, selectedEvent.createdBy)
          }
          onEdit={() => alert(`You want fix: ${selectedEvent.title}`)}
          onUpdate={handleUpdate}
          canDelete={
            myId &&
            selectedEvent &&
            String(selectedEvent.createdBy) === String(myId)
          }
        />
      )}
    </div>
  );
}
