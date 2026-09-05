import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

// 1. Fetch Conversations (Channels & DMs)
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch conversations");
    }
  }
);

// 2. Fetch Messages for active conversation (default limit: 15 for pagination)
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, page = 1, limit = 15 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CHAT.MESSAGES(conversationId),
        { params: { page, limit } }
      );
      return {
        conversationId,
        messages: response.data.data.messages,
        pagination: response.data.data.pagination,
        page,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  }
);

// 3. Create a Channel
export const createChannel = createAsyncThunk(
  "chat/createChannel",
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHAT.CREATE_CHANNEL, {
        name,
        description,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create channel");
    }
  }
);

// 4. Open/Create Direct Message
export const openDirectMessage = createAsyncThunk(
  "chat/openDirectMessage",
  async (arg, { rejectWithValue }) => {
    try {
      const recipientId = typeof arg === "object" && arg !== null ? arg.recipientId : arg;
      const response = await apiClient.post(API_ENDPOINTS.CHAT.DIRECT_MESSAGE, {
        recipientId,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to open direct message");
    }
  }
);

// 5. Mark Conversation as Read
export const markConversationAsRead = createAsyncThunk(
  "chat/markConversationAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await apiClient.patch(API_ENDPOINTS.CHAT.MARK_READ(conversationId));
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark as read");
    }
  }
);

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  onlineUserIds: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingMoreMessages: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversationId: (state, action) => {
      if (state.activeConversationId !== action.payload) {
        state.activeConversationId = action.payload;
        state.isLoadingMessages = true;
        state.messages = [];
        state.pagination = { page: 1, totalPages: 1, total: 0 };
      }
    },
    setOnlineUserIds: (state, action) => {
      state.onlineUserIds = action.payload;
    },
    addMessageReceived: (state, action) => {
      const message = action.payload;
      if (!message || !message.conversationId) return;

      const conversationId =
        typeof message.conversationId === "object"
          ? message.conversationId._id
          : message.conversationId;

      // If active conversation, append message if not already present
      if (state.activeConversationId === conversationId) {
        const exists = state.messages.some((m) => m._id === message._id);
        if (!exists) {
          state.messages.push(message);
        }
      }

      // Update conversation list item lastMessage & unread count
      const convIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (convIndex !== -1) {
        const conv = state.conversations[convIndex];
        conv.lastMessage = message;
        conv.lastMessageAt = message.createdAt;

        // If not current active conversation, increment unread count
        if (state.activeConversationId !== conversationId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        // Move updated conversation to top
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    updateConversationSnippet: (state, action) => {
      const { conversationId, lastMessage, lastMessageAt } = action.payload;
      const convIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (convIndex !== -1) {
        const conv = state.conversations[convIndex];
        conv.lastMessage = lastMessage;
        conv.lastMessageAt = lastMessageAt;

        if (state.activeConversationId !== conversationId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload;
        // If no active conversation set, default to first channel if available
        if (!state.activeConversationId && action.payload.length > 0) {
          state.activeConversationId = action.payload[0]._id;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload;
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.isLoadingMessages = true;
          state.messages = [];
        } else {
          state.isLoadingMoreMessages = true;
        }
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.isLoadingMoreMessages = false;
        state.pagination = action.payload.pagination;
        if (action.payload.page === 1) {
          state.messages = action.payload.messages;
        } else {
          // Prepend older messages cleanly for pagination without duplicates
          const existingIds = new Set(state.messages.map((m) => m._id));
          const uniqueNew = action.payload.messages.filter((m) => !existingIds.has(m._id));
          state.messages = [...uniqueNew, ...state.messages];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.isLoadingMoreMessages = false;
        state.error = action.payload;
      })

      // Create Channel
      .addCase(createChannel.fulfilled, (state, action) => {
        const newChannel = action.payload;
        const exists = state.conversations.some((c) => c._id === newChannel._id);
        if (!exists) {
          state.conversations.unshift(newChannel);
        }
        state.activeConversationId = newChannel._id;
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Open Direct Message
      .addCase(openDirectMessage.fulfilled, (state, action) => {
        const dmConv = action.payload;
        const exists = state.conversations.some((c) => c._id === dmConv._id);
        if (!exists) {
          state.conversations.unshift(dmConv);
        }
        state.activeConversationId = dmConv._id;
      })
      .addCase(openDirectMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark Conversation As Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (conv) {
          conv.unreadCount = 0;
        }
      });
  },
});

export const {
  setActiveConversationId,
  setOnlineUserIds,
  addMessageReceived,
  updateConversationSnippet,
  clearChatError,
} = chatSlice.actions;

export default chatSlice.reducer;
