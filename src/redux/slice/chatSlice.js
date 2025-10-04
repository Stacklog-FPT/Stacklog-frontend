import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  boxes: [],
  messagesByBox: {},
  selectedBoxId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    apiStart(state) {
      state.pending = true;
      state.error = null;
    },
    apiSuccess(state) {
      state.pending = false;
      state.error = null;
    },
    apiFailure(state, action) {
      state.pending = false;
      state.error = action.payload || 'API request failed';
    },

    setBoxes(state, action) {
      state.boxes = Array.isArray(action.payload) ? action.payload : [];
      state.pending = false;
      state.error = null;
    },

    setBox(state, action) {
      const box = action.payload;
      if (!box) return;
      const id = box.id || box.boxChatId || box._id || (box.boxChat && box.boxChat.boxChatId);
      if (!id) return;
      const idx = state.boxes.findIndex((b) => (b.id || b.boxChatId || b._id) === id || (b.boxChat && b.boxChat.boxChatId) === id);
      if (idx !== -1) state.boxes[idx] = { ...state.boxes[idx], ...box };
      else state.boxes.unshift(box);
    },

    setMessages(state, action) {
      const { boxId, messages } = action.payload || {};
      if (!boxId) return;
      state.messagesByBox[boxId] = Array.isArray(messages) ? messages : (messages?.data || []);
      state.pending = false;
      state.error = null;
    },

    addMessage(state, action) {
      const { boxId, message } = action.payload || {};
      if (!boxId || !message) return;
      if (!state.messagesByBox[boxId]) state.messagesByBox[boxId] = [];
      const list = state.messagesByBox[boxId];
      const mid = message.chatMessageId || message._id || message.id;
      if (mid) {
        const idx = list.findIndex((m) => (m.chatMessageId || m._id || m.id) === mid);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...message };
          return;
        }
        list.push(message);
        return;
      }
      const exists = list.some((m) => m.chatMessageContent === message.chatMessageContent && m.createdBy === message.createdBy && new Date(m.createdAt).getTime() === new Date(message.createdAt).getTime());
      if (!exists) list.push(message);
    },

    updateMessage(state, action) {
      const { boxId, messageId, changes } = action.payload || {};
      if (!boxId || !messageId) return;
      const list = state.messagesByBox[boxId] || [];
      const idx = list.findIndex((m) => (m.chatMessageId || m._id || m.id) === messageId);
      if (idx !== -1) list[idx] = { ...list[idx], ...(changes || {}) };
    },

    removeMessage(state, action) {
      const { boxId, messageId } = action.payload || {};
      if (!boxId || !messageId) return;
      const list = state.messagesByBox[boxId] || [];
      state.messagesByBox[boxId] = list.filter((m) => (m.chatMessageId || m._id || m.id) !== messageId);
    },

    setSelectedBoxId(state, action) {
      state.selectedBoxId = action.payload;
    },
  },
});

export const {
  apiStart,
  apiSuccess,
  apiFailure,
  setBoxes,
  setBox,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setSelectedBoxId,
} = chatSlice.actions;

export default chatSlice.reducer;
