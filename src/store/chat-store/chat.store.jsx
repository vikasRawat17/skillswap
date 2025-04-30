import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://skillswapserver.onrender.com/api";

const INITIAL_STATE = {
  loading: false,
  messages: [],
  chatId: null,
  error: null,
};

// Start a new chat
export const startChat = createAsyncThunk(
  "chat/startChat",
  async ({ otherUserId }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.authReducer.token;

      const response = await axios.post(
        `${API_URL}/chats/start`,
        { otherUserId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Send initial message
export const sendInitialMessage = createAsyncThunk(
  "chat/sendInitialMessage",
  async ({ chatId, content }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.authReducer.token;

      const response = await axios.post(
        `${API_URL}/chats/${chatId}/message`,
        { content },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Fetch messages for a chat
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.authReducer.token;

      const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
        withCredentials: true,
        headers: {
          Authorization: token,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: INITIAL_STATE,
  reducers: {
    addIncomingMessage: (state, action) => {
      state.messages.push({
        content: action.payload.content,
        timestamp: action.payload.timestamp,
        sender: {
          id: action.payload.sender?.id,
          name: action.payload.sender?.name || null,
        },
      });
    },

    resetChatState: (state) => {
      state.loading = false;
      state.error = null;
      state.messages = [];
      state.chatId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chatId = action.payload.id;
        state.error = null;
      })
      .addCase(startChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.map((msg) => ({
          content: msg.content,
          timestamp: msg.timestamp,
          sender: {
            id: msg.sender?.id,
            name: msg.sender?.name || null,
          },
        }));
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendInitialMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInitialMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          content: action.payload.content,
          timestamp: action.payload.timestamp,
          sender: {
            id: action.payload.sender?.id || null,
            name: action.payload.sender?.name || null,
          },
        });
        state.error = null;
      })
      .addCase(sendInitialMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetChatState, addIncomingMessage } = chatSlice.actions;
export default chatSlice.reducer;
