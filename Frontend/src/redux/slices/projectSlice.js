import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const initialState = {
  projects: [],
  currentProject: null,
  stats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Async Thunk: Fetch Projects
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.LIST);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch projects.");
    }
  }
);

// Async Thunk: Fetch Project By Id (includes stats & metadata)
export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PROJECTS.BY_ID(projectId)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch project details.");
    }
  }
);

// Async Thunk: Create Project
export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PROJECTS.CREATE,
        projectData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create project.");
    }
  }
);

// Async Thunk: Update Project Members
export const updateProjectMembers = createAsyncThunk(
  "projects/updateProjectMembers",
  async ({ projectId, members }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.PROJECTS.MEMBERS(projectId),
        { members }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update project members."
      );
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.stats = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data || [];
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchProjectById
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload.data?.project || null;
        state.stats = action.payload.data?.stats || null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createProject
      .addCase(createProject.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload.data) {
          state.projects.unshift(action.payload.data);
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // updateProjectMembers
      .addCase(updateProjectMembers.fulfilled, (state, action) => {
        const updated = action.payload.data;
        if (updated) {
          if (state.currentProject && state.currentProject._id === updated._id) {
            state.currentProject.members = updated.members;
          }
          const index = state.projects.findIndex((p) => p._id === updated._id);
          if (index !== -1) {
            state.projects[index].members = updated.members;
          }
        }
      });
  },
});

export const { clearCurrentProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
