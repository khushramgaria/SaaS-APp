import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";

// Global or Project-scoped Task list (Newest first)
export const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assigneeId, search } = req.query;

    const filter = { workspaceId: req.workspaceId };

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assigneeId) filter.assigneeId = assigneeId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { taskKey: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// Create a task without order math
export const createTask = async (req, res, next) => {
  try {
    const {
      projectId,
      title,
      description,
      priority,
      assigneeId,
      dueDate,
      tags,
      status,
    } = req.body;

    if (!projectId || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Project and title are required." });
    }

    const project = await Project.findOneAndUpdate(
      { _id: projectId, workspaceId: req.workspaceId },
      { $inc: { taskCounter: 1 } },
      { new: true },
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    const taskNumber = project.taskCounter;
    const taskKey = `${project.key}-${taskNumber}`;

    const task = await Task.create({
      workspaceId: req.workspaceId,
      projectId,
      taskNumber,
      taskKey,
      title,
      description: description || "",
      priority: priority || "MEDIUM",
      status: status || "TODO",
      assigneeId: assigneeId || null,
      reporterId: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
    });

    const populated = await task.populate([
      { path: "assigneeId", select: "name email avatarUrl" },
      { path: "reporterId", select: "name email avatarUrl" },
      { path: "projectId", select: "name key" },
    ]);

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Simple status-only update for Drag & Drop
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid target status is required.",
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, workspaceId: req.workspaceId },
      { $set: { status } },
      { new: true },
    )
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// General task edit
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, workspaceId: req.workspaceId },
      { $set: req.body },
      { new: true, runValidators: true },
    )
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      workspaceId: req.workspaceId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
};
