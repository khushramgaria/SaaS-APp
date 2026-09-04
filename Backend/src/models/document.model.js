import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Document",
    },
    content: {
      type: String, // Rich-Text HTML content
      default: "",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // If empty: accessible to all workspace members
    // If populated: accessible only to these users, author, owner, and admin
    allowedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

documentSchema.index({ title: "text", content: "text", tags: "text" });

export const Document = mongoose.model("Document", documentSchema);
