import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const initialState = {
  workspaceActivities: [],
  projectActivities: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  isLoading: false,
  error: null,
};

// Thunk 1: Fetch workspace-wide activities (paginated)
export const fetchWorkspaceActivities = createAsyncThunk(
  "activity/fetchWorkspaceActivities",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ACTIVITIES.WORKSPACE, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch workspace activities."
      );
    }
  }
);

// Thunk 2: Fetch project-scoped activities
export const fetchProjectActivities = createAsyncThunk(
  "activity/fetchProjectActivities",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ACTIVITIES.PROJECT(projectId),
        { params: { limit: 15 } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch project activities."
      );
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    clearActivityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Workspace Activities
      .addCase(fetchWorkspaceActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        const { activities, pagination } = action.payload?.data || {};
        state.workspaceActivities = activities || [];
        state.pagination = pagination || { page: 1, totalPages: 1, total: 0 };
      })
      .addCase(fetchWorkspaceActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Project Activities
      .addCase(fetchProjectActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectActivities = action.payload?.data || [];
      })
      .addCase(fetchProjectActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivityError } = activitySlice.actions;
export default activitySlice.reducer;
