import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Array of user IDs who have seen this message.
    // Unread count math: count messages where `readBy` does NOT contain req.user._id
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

// Compound index: Fetch paginated messages inside a conversation ordered by time
messageSchema.index({ conversationId: 1, createdAt: 1 });

// Index for unread queries: Find messages in conversation not read by current user
messageSchema.index({ conversationId: 1, readBy: 1 });

export const Message = mongoose.model("Message", messageSchema);
