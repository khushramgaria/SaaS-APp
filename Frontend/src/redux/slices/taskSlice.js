import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Async Thunk: Fetch Tasks (Global or Project Scoped with filters)
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.projectId) query.append("projectId", params.projectId);
      if (params.status) query.append("status", params.status);
      if (params.priority) query.append("priority", params.priority);
      if (params.assigneeId) query.append("assigneeId", params.assigneeId);
      if (params.search) query.append("search", params.search);

      const queryString = query.toString();
      const url = `${API_ENDPOINTS.TASKS.LIST}${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch tasks.");
    }
  }
);

// Async Thunk: Create Task
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.TASKS.CREATE,
        taskData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create task.");
    }
  }
);

// Async Thunk: Update Task Status (Backend persistence for Drag & Drop)
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ taskId, status, previousStatus }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.TASKS.STATUS(taskId),
        { status }
      );
      return { taskId, status, data: response.data };
    } catch (error) {
      return rejectWithValue({
        taskId,
        previousStatus,
        message: error.message || "Failed to update task status.",
      });
    }
  }
);

// Async Thunk: Update Task Details
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, ...updateFields }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.TASKS.BY_ID(taskId),
        updateFields
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update task.");
    }
  }
);

// Async Thunk: Delete Task
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.TASKS.BY_ID(taskId)
      );
      return { taskId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete task.");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Optimistic reducer for Drag & Drop
    moveTaskOptimistically: (state, action) => {
      const { taskId, destinationStatus } = action.payload;
      const task = state.tasks.find((t) => t._id === taskId);
      if (task) {
        task._previousStatus = task.status;
        task.status = destinationStatus;
      }
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data || [];
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createTask
      .addCase(createTask.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload.data) {
          state.tasks.unshift(action.payload.data);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // updateTaskStatus (fulfilled vs rejected rollback)
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload.data?.data;
        if (updatedTask) {
          const index = state.tasks.findIndex((t) => t._id === updatedTask._id);
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
          if (state.currentTask && state.currentTask._id === updatedTask._id) {
            state.currentTask = updatedTask;
          }
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        const { taskId, previousStatus } = action.payload || {};
        if (taskId && previousStatus) {
          const task = state.tasks.find((t) => t._id === taskId);
          if (task) {
            task.status = previousStatus;
          }
        }
      })

      // updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload.data;
        if (updatedTask) {
          const index = state.tasks.findIndex((t) => t._id === updatedTask._id);
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
          if (state.currentTask && state.currentTask._id === updatedTask._id) {
            state.currentTask = updatedTask;
          }
        }
      })

      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { taskId } = action.payload;
        state.tasks = state.tasks.filter((t) => t._id !== taskId);
        if (state.currentTask && state.currentTask._id === taskId) {
          state.currentTask = null;
        }
      });
  },
});

export const { moveTaskOptimistically, setCurrentTask, clearTaskError } =
  taskSlice.actions;
export default taskSlice.reducer;
