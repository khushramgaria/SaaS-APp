import { Activity } from "../models/activity.model.js";

export const logActivity = async ({
  workspaceId,
  userId,
  projectId = null,
  taskId = null,
  action,
  metadata = {},
}) => {
  try {
    await Activity.create({
      workspaceId,
      userId,
      projectId,
      taskId,
      action,
      metadata,
    });
  } catch (error) {
    console.error("Failed to write activity log:", error.message);
  }
};
