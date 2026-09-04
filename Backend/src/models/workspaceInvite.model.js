import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MEMBER", "VIEWER"],
      default: "MEMBER",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

workspaceInviteSchema.index({ workspaceId: 1, email: 1 });

export const WorkspaceInvite = mongoose.model(
  "WorkspaceInvite",
  workspaceInviteSchema,
);
