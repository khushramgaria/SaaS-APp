import axios from "axios";

// API Base URL (defaults to http://localhost:3000/api/v1)
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Centralized API endpoints list
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
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

// Response Interceptor to handle errors and token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // Return normalized error object
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  },
);

export default apiClient;
