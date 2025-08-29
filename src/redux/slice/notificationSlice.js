import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  pending: false,
  error: '',
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState: initialState,
  reducers: {
    setPending: (state, action) => {
      state.pending = true;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    getNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotifications: (state, action) => {
      state.notifications.push(action.payload);
    },
    markAllRead: (state, action) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter((nt) => nt.id !== action.payload);
    },
  },
});

export const {
  setPending,
  setError,
  getNotifications,
  addNotifications,
  markAllRead,
  deleteNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
