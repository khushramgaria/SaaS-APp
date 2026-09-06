import { io } from "socket.io-client";

let socket = null;

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL)
    return import.meta.env.VITE_API_BASE_URL;
  return "http://localhost:8000";
};

export const connectSocket = () => {
  if (!socket) {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const SOCKET_URL = getSocketUrl();

    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token,
      },
    });
  }

  if (socket && !socket.connected) {
    // Ensure latest token on reconnect attempt
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    socket.auth = { token };
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export const joinWorkspace = (workspaceId) => {
  if (socket && workspaceId) {
    socket.emit("join_workspace", workspaceId);
  }
};

export const joinConversation = (conversationId) => {
  if (socket && conversationId) {
    socket.emit("join_conversation", conversationId);
  }
};

export const leaveConversation = (conversationId) => {
  if (socket && conversationId) {
    socket.emit("leave_conversation", conversationId);
  }
};

export const sendMessage = ({ conversationId, content }) => {
  if (socket && conversationId && content) {
    socket.emit("send_message", { conversationId, content });
  }
};
