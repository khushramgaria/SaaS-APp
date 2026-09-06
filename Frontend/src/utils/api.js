import axios from "axios";
import { addToOfflineQueue } from "../services/offlineSyncService";
import toast from "react-hot-toast";

export const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    INVITE_DETAILS: (token) => `/auth/invites/${token}`,
    ACCEPT_INVITE: (token) => `/auth/invites/${token}/accept`,
  },
  WORKSPACES: {
    MEMBERS: "/workspaces/members",
    MEMBER_ROLE: (memberId) => `/workspaces/members/${memberId}/role`,
    REMOVE_MEMBER: (memberId) => `/workspaces/members/${memberId}`,
    INVITES: "/workspaces/invites",
    RESEND_INVITE: (inviteId) => `/workspaces/invites/${inviteId}/resend`,
    REVOKE_INVITE: (inviteId) => `/workspaces/invites/${inviteId}`,
  },
  PROJECTS: {
    LIST: "/projects",
    CREATE: "/projects",
    BY_ID: (projectId) => `/projects/${projectId}`,
    MEMBERS: (projectId) => `/projects/${projectId}/members`,
  },
  TASKS: {
    LIST: "/tasks",
    CREATE: "/tasks",
    STATUS: (taskId) => `/tasks/${taskId}/status`,
    BY_ID: (taskId) => `/tasks/${taskId}`,
  },
  DOCUMENTS: {
    LIST: "/documents",
    CREATE: "/documents",
    BY_ID: (documentId) => `/documents/${documentId}`,
    UPLOAD: "/documents/upload",
  },
  ACTIVITIES: {
    WORKSPACE: "/activities",
    PROJECT: (projectId) => `/activities/projects/${projectId}`,
  },
  USERS: {
    PROFILE: "/users/profile",
    AVATAR: "/users/avatar",
    CHANGE_PASSWORD: "/users/change-password",
  },
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    CREATE_CHANNEL: "/chat/channels",
    DIRECT_MESSAGE: "/chat/direct",
    MESSAGES: (conversationId) =>
      `/chat/conversations/${conversationId}/messages`,
    MARK_READ: (conversationId) => `/chat/conversations/${conversationId}/read`,
  },
};

// Create Axios Instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to attach Access Token & Workspace Header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
    if (activeWorkspaceId) {
      config.headers["x-workspace-id"] = activeWorkspaceId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor to handle errors, network failures, and offline queuing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      !navigator.onLine;

    const method = error.config?.method?.toUpperCase() || "GET";

    // If write operation fails due to network/offline status, queue it automatically!
    if (isNetworkError && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const url = error.config.url;
      const payload = error.config.data
        ? typeof error.config.data === "string"
          ? JSON.parse(error.config.data)
          : error.config.data
        : null;

      addToOfflineQueue({
        method,
        url,
        payload,
      });

      toast.success(
        "Network connection offline. Action queued to sync automatically!",
        { icon: "📝", duration: 4000 }
      );

      return Promise.resolve({
        data: {
          success: true,
          offline: true,
          message: "Action queued for sync.",
        },
      });
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // Return normalized error object
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
      isOffline: isNetworkError,
    });
  },
);

export default apiClient;
