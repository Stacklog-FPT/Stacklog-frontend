import { useEffect, useState, useMemo } from "react";
import {
  Calendar as RBCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "./Calendar.scss";
import Modal from "./SlotModal";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  deleteScheduleSlot,
  updateScheduleSlot,
  getPersonalScheduleBySemester,
} from "../../../service/ScheduleService";
import { useAuth } from "../../../context/AuthProvider";
import { addHours } from "date-fns";
import { Toaster, toast } from "sonner";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import decodeToken from "../../../service/DecodeJwt";
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(RBCalendar);

export default function Calendar({ groupId, isPage }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  let myId = null;
  try {
    myId = user?.token ? decodeToken(user.token).id : null;
  } catch (e) {
    myId = null;
  }
  console.log("MyId: ", myId);
  const { schedules, pending } = useSelector((s) => s.schedule);
  const [selectedEvent, setSelectedEvent] = useState(null);
  try {
    console.log(
      "Calendar debug - user token:",
      user?.token ? "available" : "not available"
    );
    if (user?.token) {
      try {
        console.log(
          "Calendar debug - decoded user id:",
          decodeToken(user.token).id
        );
      } catch (e) {
        console.log("Calendar debug - decodeToken failed", e);
      }
    }
    console.log(
      "Calendar debug - schedules length:",
      Array.isArray(schedules) ? schedules.length : "n/a"
    );
  } catch (e) {
    /* ignore */
  }
  const currentSemesterId = useSelector((s) => s.semester?.currentSemesterId);
  const showingSchedule = () => {
    let scheduleList = [];

    const myId = user?.token ? decodeToken(user.token).id : null;

    if (isPage) {
      try {
        console.log(
          "schedules (count):",
          Array.isArray(schedules) ? schedules.length : 0
        );
        if (Array.isArray(schedules)) {
          console.log(
            "schedules ids:",
            schedules.map((x) => ({
              slotId: x.slotId ?? x.id,
              createdBy: x.createdBy,
            }))
          );
        }
      } catch (err) {}

      scheduleList = schedules.filter((s) => {
        const assigns =
          s.assignTo ??
          s.userIdAssigns ??
          (Array.isArray(s.slotAssigns)
            ? s.slotAssigns.map((a) => a.userId).filter(Boolean)
            : []);

        const assignsNormalized = assigns.map((id) => String(id));
        const myIdStr = myId ? String(myId) : null;
        const createdByStr = s.createdBy ? String(s.createdBy) : null;

        if (myIdStr && assignsNormalized.includes(myIdStr)) return true;

        if (myIdStr && createdByStr && createdByStr === myIdStr) return true;

        return false;
      });
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
      groupId: isPage ? null : updatedEvent.groupId || [],
      userIdAssigns: isPage
        ? []
        : updatedEvent.userIdAssigns || updatedEvent.assignTo || [],
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
        groupId: isPage ? null : updatedEvent.groupId || "",
        userIdAssigns: isPage
          ? []
          : updatedEvent.userIdAssigns || updatedEvent.assignTo || [],
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
      title: "Are you sure to delete this slot?",
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
    if (!user?.token) {
      console.log("Calendar: skipping fetch — user token not ready");
      return;
    }

    const semesterIdParam = currentSemesterId ?? undefined;
    console.log(
      "Calendar: fetching personal schedules for semesterId=",
      semesterIdParam
    );
    getPersonalScheduleBySemester(user.token, semesterIdParam, dispatch).catch(
      (err) => console.log("getPersonalScheduleBySemester error", err)
    );
  }, [currentSemesterId, user?.token]);

  return (
    <div className="calendar-wrapper">
      <Toaster position="bottom-right" richColors closeButton />
      {/* {pending && <div className="loading-overlay">Waiting for minutes...</div>} */}
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
          views={['month', 'week', 'day']}
          messages={{
            today: 'Present',
          }}
          formats={{
            eventTimeRangeFormat: ({ start }) => moment(start).format('h:mm A'),
            timeGutterFormat: 'h:mm A',
            agendaTimeRangeFormat: ({ start }) => moment(start).format('h:mm A'),
          }}
        />
      </DndProvider>

      {selectedEvent && (
        <Modal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={() =>
            handleDelete(selectedEvent.id, selectedEvent.createdBy)
          }
          onEdit={() => Swal.fire({
            icon: 'info',
            title: 'Edit Event',
            text: `You want to edit: ${selectedEvent.title}`
          })}
          onUpdate={handleUpdate}
          onRefresh={() => {
            const semesterIdParam = currentSemesterId ?? undefined;
            return getPersonalScheduleBySemester(user.token, semesterIdParam, dispatch);
          }}
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
