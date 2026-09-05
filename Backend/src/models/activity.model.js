import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        // Member & Invite Actions
        "MEMBER_INVITED",
        "MEMBER_INVITE_RESENT",
        "MEMBER_INVITE_REVOKED",
        "MEMBER_ROLE_UPDATED",
        "MEMBER_REMOVED",
        "MEMBER_JOINED",

        // Task & Project Actions
        "TASK_CREATED",
        "TASK_STATUS_UPDATED",
        "TASK_PRIORITY_UPDATED",
        "TASK_ASSIGNEE_UPDATED",
        "TASK_DUE_DATE_UPDATED",
        "TASK_DELETED",
        "PROJECT_CREATED",
        "DOCUMENT_CREATED",

        // Documents
        "DOCUMENT_CREATED",
        "DOCUMENT_UPDATED",
        "DOCUMENT_DELETED",

        // Projects
        "PROJECT_CREATED",
        "PROJECT_MEMBERS_UPDATED",
      ],
    },
    metadata: {
      docTitle: String,
      projectName: String,
      projectKey: String,
      memberCount: Number,
      taskKey: String,
      taskTitle: String,
      fromStatus: String,
      toStatus: String,
      fromPriority: String,
      toPriority: String,
      assigneeName: String,
      dueDate: Date,
      targetUserEmail: String,
      targetUserName: String,
      fromRole: String,
      toRole: String,
      role: String,
    },
  },
  { timestamps: true },
);

activitySchema.index({ workspaceId: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
