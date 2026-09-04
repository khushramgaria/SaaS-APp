import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const initialState = {
  members: [],
  invites: [],
  isLoadingMembers: false,
  isLoadingInvites: false,
  isSubmittingInvite: false,
  error: null,
};

// Async Thunk: Fetch Workspace Members
export const fetchMembers = createAsyncThunk(
  "members/fetchMembers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WORKSPACES.MEMBERS);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load members.");
    }
  }
);

// Async Thunk: Update Member Role
export const updateMemberRole = createAsyncThunk(
  "members/updateMemberRole",
  async ({ memberId, role }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.WORKSPACES.MEMBER_ROLE(memberId),
        { role }
      );
      return { memberId, role, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update member role.");
    }
  }
);

// Async Thunk: Remove Member
export const removeMember = createAsyncThunk(
  "members/removeMember",
  async (memberId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.WORKSPACES.REMOVE_MEMBER(memberId)
      );
      return { memberId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove member.");
    }
  }
);

// Async Thunk: Fetch Invites
export const fetchInvites = createAsyncThunk(
  "members/fetchInvites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WORKSPACES.INVITES);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load invitations.");
    }
  }
);

// Async Thunk: Create Invite
export const createInvite = createAsyncThunk(
  "members/createInvite",
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WORKSPACES.INVITES, {
        email,
        role,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send invite.");
    }
  }
);

// Async Thunk: Resend Invite
export const resendInvite = createAsyncThunk(
  "members/resendInvite",
  async (inviteId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WORKSPACES.RESEND_INVITE(inviteId)
      );
      return { inviteId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to resend invite.");
    }
  }
);

// Async Thunk: Revoke Invite
export const revokeInvite = createAsyncThunk(
  "members/revokeInvite",
  async (inviteId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.WORKSPACES.REVOKE_INVITE(inviteId)
      );
      return { inviteId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to revoke invite.");
    }
  }
);

const memberSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearMemberError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Members
      .addCase(fetchMembers.pending, (state) => {
        state.isLoadingMembers = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoadingMembers = false;
        state.members = action.payload.data || [];
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoadingMembers = false;
        state.error = action.payload;
      })

      // Update Role
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const { memberId, role } = action.payload;
        const member = state.members.find((m) => m.membershipId === memberId);
        if (member) {
          member.role = role;
        }
      })

      // Remove Member
      .addCase(removeMember.fulfilled, (state, action) => {
        const { memberId } = action.payload;
        state.members = state.members.filter(
          (m) => m.membershipId !== memberId
        );
      })

      // Fetch Invites
      .addCase(fetchInvites.pending, (state) => {
        state.isLoadingInvites = true;
        state.error = null;
      })
      .addCase(fetchInvites.fulfilled, (state, action) => {
        state.isLoadingInvites = false;
        state.invites = action.payload.data || [];
      })
      .addCase(fetchInvites.rejected, (state, action) => {
        state.isLoadingInvites = false;
        state.error = action.payload;
      })

      // Create Invite
      .addCase(createInvite.pending, (state) => {
        state.isSubmittingInvite = true;
        state.error = null;
      })
      .addCase(createInvite.fulfilled, (state, action) => {
        state.isSubmittingInvite = false;
        if (action.payload.data) {
          state.invites.unshift(action.payload.data);
        }
      })
      .addCase(createInvite.rejected, (state, action) => {
        state.isSubmittingInvite = false;
        state.error = action.payload;
      })

      // Resend Invite
      .addCase(resendInvite.fulfilled, (state, action) => {
        const { inviteId, data } = action.payload;
        const invite = state.invites.find((i) => i._id === inviteId);
        if (invite && data?.data?.expiresAt) {
          invite.expiresAt = data.data.expiresAt;
          invite.isExpired = false;
        }
      })

      // Revoke Invite
      .addCase(revokeInvite.fulfilled, (state, action) => {
        const { inviteId } = action.payload;
        state.invites = state.invites.filter((i) => i._id !== inviteId);
      });
  },
});

export const { clearMemberError } = memberSlice.actions;
export default memberSlice.reducer;
