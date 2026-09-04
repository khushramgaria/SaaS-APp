import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

// Safely parse JSON from localStorage
const getStoredJSON = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

const initialToken = localStorage.getItem("token") || null;
const initialUser = getStoredJSON("user");
const initialActiveWorkspace = getStoredJSON("activeWorkspace");

const initialState = {
  user: initialUser,
  token: initialToken,
  activeWorkspace: initialActiveWorkspace,
  workspaces: [],
  isAuthenticated: Boolean(initialToken),
  isLoading: false,
  error: null,
};

// Async Thunk: Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed.");
    }
  }
);

// Async Thunk: Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed.");
    }
  }
);

// Async Thunk: Fetch Current User Profile
export const getMeUser = createAsyncThunk(
  "auth/getMeUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user profile.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
      if (action.payload?.id) {
        localStorage.setItem("activeWorkspaceId", action.payload.id);
        localStorage.setItem("activeWorkspace", JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.activeWorkspace = null;
      state.workspaces = [];
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("activeWorkspace");
      localStorage.removeItem("activeWorkspaceId");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { accessToken, user, activeWorkspace } = action.payload.data || {};
        
        state.token = accessToken;
        state.user = user;
        state.activeWorkspace = activeWorkspace;
        state.isAuthenticated = true;

        if (accessToken) localStorage.setItem("token", accessToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        if (activeWorkspace) {
          localStorage.setItem("activeWorkspace", JSON.stringify(activeWorkspace));
          if (activeWorkspace.id) {
            localStorage.setItem("activeWorkspaceId", activeWorkspace.id);
          }
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { accessToken, user, workspaces, activeWorkspace } =
          action.payload.data || {};

        state.token = accessToken;
        state.user = user;
        state.workspaces = workspaces || [];
        state.activeWorkspace = activeWorkspace || (workspaces && workspaces[0]) || null;
        state.isAuthenticated = true;

        if (accessToken) localStorage.setItem("token", accessToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        if (state.activeWorkspace) {
          localStorage.setItem(
            "activeWorkspace",
            JSON.stringify(state.activeWorkspace)
          );
          if (state.activeWorkspace.id) {
            localStorage.setItem("activeWorkspaceId", state.activeWorkspace.id);
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Me
      .addCase(getMeUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, workspaces } = action.payload.data || {};
        if (user) {
          state.user = user;
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (workspaces) {
          state.workspaces = workspaces;
        }
      })
      .addCase(getMeUser.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export const { setActiveWorkspace, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
