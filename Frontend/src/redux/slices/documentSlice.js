import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const initialState = {
  documents: [],
  currentDocument: null,
  isSaving: false,
  isLoading: false,
  error: null,
};

// Async Thunk: Fetch Documents (search, project, tag filters)
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.projectId) query.append("projectId", params.projectId);
      if (params.tag) query.append("tag", params.tag);
      if (params.search) query.append("search", params.search);

      const queryString = query.toString();
      const url = `${API_ENDPOINTS.DOCUMENTS.LIST}${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch documents.");
    }
  }
);

// Async Thunk: Fetch Document By ID
export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DOCUMENTS.BY_ID(documentId)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load document.");
    }
  }
);

// Async Thunk: Create Document
export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async (docData = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DOCUMENTS.CREATE,
        docData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create document.");
    }
  }
);

// Async Thunk: Update Document (used for manual save and debounced autosave)
export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ documentId, ...fields }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.DOCUMENTS.BY_ID(documentId),
        fields
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to save document.");
    }
  }
);

// Async Thunk: Delete Document
export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.DOCUMENTS.BY_ID(documentId)
      );
      return { documentId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete document.");
    }
  }
);

// Async Thunk: Upload Media to Cloudinary via backend
export const uploadMedia = createAsyncThunk(
  "documents/uploadMedia",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        API_ENDPOINTS.DOCUMENTS.UPLOAD,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to upload image.");
    }
  }
);

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    setIsSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    clearDocumentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.data || [];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchDocumentById
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload.data || null;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createDocument
      .addCase(createDocument.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.documents.unshift(action.payload.data);
          state.currentDocument = action.payload.data;
        }
      })

      // updateDocument
      .addCase(updateDocument.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isSaving = false;
        const updated = action.payload.data;
        if (updated) {
          state.currentDocument = updated;
          const index = state.documents.findIndex((d) => d._id === updated._id);
          if (index !== -1) {
            state.documents[index] = updated;
          }
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // deleteDocument
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const { documentId } = action.payload;
        state.documents = state.documents.filter((d) => d._id !== documentId);
        if (state.currentDocument && state.currentDocument._id === documentId) {
          state.currentDocument = null;
        }
      });
  },
});

export const {
  setCurrentDocument,
  clearCurrentDocument,
  setIsSaving,
  clearDocumentError,
} = documentSlice.actions;
export default documentSlice.reducer;
