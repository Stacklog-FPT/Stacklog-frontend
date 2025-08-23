import { useEffect, useState, useMemo } from 'react';
import { Calendar as RBCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import './Calendar.scss';
import Modal from './SlotModal';
import Swal from 'sweetalert2';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  getScheduleByGroupId,
  deleteScheduleSlot,
  updateScheduleSlot,
} from '../../../service/ScheduleService';
import { useAuth } from '../../../context/AuthProvider';
import { addHours } from 'date-fns';
import { Toaster, toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(RBCalendar);

export default function Calendar({ groupId }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { schedules, pending } = useSelector((s) => s.schedule);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const events = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    return schedules.map((e) => {
      const id = e.slotId ?? e.id;
      const title = e.slotTitle ?? e.slotTittle ?? e.title ?? 'No title';
      const startISO = e.slotStartTime ?? e.slotStarTime ?? e.start;
      const start = startISO ? new Date(startISO) : new Date();
      const end = e.end ? new Date(e.end) : addHours(start, 1);
      return { id, title, start, end, groupId: e.groupId, ...e };
    });
  }, [schedules]);

  const moveEvent = async ({ event, start, end }) => {
    const now = new Date();

    if (start < now) {
      toast.error('Cannot move events to the past');
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
      slotDescription: updatedEvent.description || '',
      slotStarTime: new Date(start).toISOString(),
      groupId: updatedEvent.groupId || '',
      userIdAssigns: updatedEvent.userIdAssigns || [],
    };

    await updateScheduleSlot(user.token, payload.slotId, payload, dispatch);
    toast.success('Change time successfully!');
  };

  const handleUpdate = async (updatedEvent) => {
    try {
      const payload = {
        slotId: updatedEvent.id,
        slotTitle: updatedEvent.title,
        slotDescription: updatedEvent.description || '',
        slotStarTime: new Date(updatedEvent.start).toISOString(),
        groupId: updatedEvent.groupId || '',
        userIdAssigns: updatedEvent.userIdAssigns || [],
      };

      await updateScheduleSlot(user.token, payload.slotId, payload, dispatch);
      console.log('✅ Đã cập nhật slot:', payload);
    } catch (err) {
      console.error('❌ Lỗi khi update slot:', err);
    }
  };

  const handleDelete = async (id) => {
    setSelectedEvent(null);
    const result = await Swal.fire({
      title: 'Are you sure to delete this task?',
      text: "This action can't completed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#045745',
      cancelButtonColor: '#c8cad4',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) await deleteScheduleSlot(user?.token, id, dispatch);
    toast.success('Delete slot successfully!');
  };

  useEffect(() => {
    getScheduleByGroupId(user.token, groupId, dispatch);
  }, [groupId]);

  return (
    <div className="calendar-wrapper">
      <Toaster position="bottom-right" richColors closeButton />
      {pending && <div className="loading-overlay">Đang tải...</div>}
      <DndProvider backend={HTML5Backend}>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '80vh' }}
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
