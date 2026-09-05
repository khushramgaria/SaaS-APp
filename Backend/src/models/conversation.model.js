import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["CHANNEL", "DIRECT"],
      required: true,
    },
    // Required for CHANNEL (e.g. "general", "marketing"), null for DIRECT
    name: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // For DIRECT: exactly 2 user IDs.
    // For CHANNEL: member user IDs who joined/have access.
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Quick reference to the last message for the sidebar snippet & preview
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Updated whenever a new message is sent (used to sort active chats to top)
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Compound indexes:
// 1. Fetch user's active conversations sorted by most recent message
conversationSchema.index({
  workspaceId: 1,
  participants: 1,
  lastMessageAt: -1,
});

// 2. Prevent duplicate channels with the same name inside the same workspace
conversationSchema.index(
  { workspaceId: 1, name: 1 },
  { unique: true, partialFilterExpression: { type: "CHANNEL" } },
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
