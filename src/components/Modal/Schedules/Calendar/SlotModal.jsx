import { useState, useEffect } from "react";
import "./SlotModal.scss";
import { fetchUserById } from "../../../../service/UserService";
import { useAuth } from "../../../../context/AuthProvider";
import { acceptSchedule, rejectSchedule } from "../../../../service/ScheduleService";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import decodeToken from "../../../../service/DecodeJwt";

const Modal = ({ event, onClose, onDelete, onEdit, onUpdate, onRefresh, canDelete = false }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [title, setTitle] = useState(event.title);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const parseAsLocal = (iso) => {
    if (!iso) return null;
    if (iso instanceof Date) return iso;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (m) {
      const [, Y, Mo, D, H, Mi, S] = m;
      return new Date(Number(Y), Number(Mo) - 1, Number(D), Number(H), Number(Mi), Number(S || 0));
    }
    return new Date(iso);
  };

  const toInputValue = (d) => {
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const [start, setStart] = useState(toInputValue(parseAsLocal(event.start)));
  const [isEditing, setIsEditing] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  let myUserId = null;
  try {
    myUserId = user?.token ? decodeToken(user.token).id : null;
  } catch (e) {
    myUserId = null;
  }

  // Fetch user details for all assigned users
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!event.slotAssigns || event.slotAssigns.length === 0) {
        setAssignedUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        const userPromises = event.slotAssigns.map(async (assign) => {
          try {
            const userData = await fetchUserById(user.token, assign.userId);
            return {
              ...assign,
              userData,
            };
          } catch (err) {
            console.error(`Failed to fetch user ${assign.userId}:`, err);
            return {
              ...assign,
              userData: null,
            };
          }
        });

        const users = await Promise.all(userPromises);
        setAssignedUsers(users);
      } catch (err) {
        console.error("Failed to fetch assigned users:", err);
        setAssignedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAssignedUsers();
  }, [event, user.token]);

  const handleSave = () => {
    onUpdate({
      ...event,
      title,
      start: new Date(start),
      end: event.end ? event.end : null,
    });
    setIsEditing(false);
    onClose();
  };

  const handleAccept = async (slotAssignId) => {
    try {
      await acceptSchedule(user.token, event.slotId || event.id, dispatch);
      toast.success("Schedule accepted successfully!");
      
      // Refresh schedule list to get updated status
      if (onRefresh) {
        await onRefresh();
      }
      
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to accept schedule");
    }
  };

  const handleReject = async (slotAssignId) => {
    try {
      await rejectSchedule(user.token, event.slotId || event.id, dispatch);
      toast.error("Schedule rejected");
      
      // Refresh schedule list to get updated status
      if (onRefresh) {
        await onRefresh();
      }
      
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to reject schedule");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Details</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="modal-field">
            <label>From:</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {/* Assigned Users Section */}
          {assignedUsers && assignedUsers.length > 0 && (
            <div className="modal-field assigned-users-section">
              <label>Assigned To:</label>
              {loadingUsers ? (
                <div className="loading-users">Loading users...</div>
              ) : (
                <div className="assigned-users-list">
                  {assignedUsers.map((assign) => {
                    const isCurrentUser = myUserId && String(assign.userId) === String(myUserId);
                    // Show actions if current user and status is PENDING or null/undefined
                    const isPending = !assign.statusSlotAssign || 
                                     assign.statusSlotAssign === null || 
                                     assign.statusSlotAssign.toLowerCase() === 'pending';
                    const showActions = isCurrentUser && !isEditing && isPending;
                    
                    return (
                      <div key={assign.slotAssignId} className="assigned-user-item">
                        <div className="user-info">
                          <img
                            src={assign.userData?.avatar_link || 'https://via.placeholder.com/40'}
                            alt={assign.userData?.full_name || 'User'}
                            className="user-avatar"
                          />
                          <div className="user-details">
                            <span className="user-name">
                              {assign.userData?.full_name || assign.userId}
                              {isCurrentUser && <span className="you-badge"> (You)</span>}
                            </span>
                            {/* Always show status for everyone */}
                            {assign.statusSlotAssign ? (
                              <span className={`status-badge status-${assign.statusSlotAssign?.toLowerCase()}`}>
                                {assign.statusSlotAssign}
                              </span>
                            ) : (
                              <span className="status-badge status-pending">Pending</span>
                            )}
                          </div>
                        </div>
                        {showActions && (
                          <div className="user-actions">
                            <button 
                              className="btn-accept" 
                              onClick={() => handleAccept(assign.slotAssignId)}
                              title="Accept this schedule"
                            >
                              ✓ Accept
                            </button>
                            <button 
                              className="btn-reject" 
                              onClick={() => handleReject(assign.slotAssignId)}
                              title="Reject this schedule"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        <div className="modal-actions">
          {!isEditing ? (
            <>
              <button className="edit" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              {canDelete ? (
                <button className="delete" onClick={onDelete}>
                  Delete
                </button>
              ) : null}
              <button className="close" onClick={onClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <button className="save" onClick={handleSave}>
                💾 Save
              </button>
              <button className="close" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
