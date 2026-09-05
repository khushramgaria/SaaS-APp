import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { logActivity } from "../services/activity.service.js";

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

    logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      projectId: task.projectId._id || task.projectId,
      taskId: task._id,
      action: "TASK_CREATED",
      metadata: {
        taskKey: task.taskKey,
        taskTitle: task.title,
      },
    });

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

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

    const existingTask = await Task.findOne({
      _id: taskId,
      workspaceId: req.workspaceId,
    });

    if (!existingTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    const fromStatus = existingTask.status;

    if (fromStatus !== status) {
      existingTask.status = status;
      await existingTask.save();

      // Log Activity: Status Updated
      logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        projectId: existingTask.projectId,
        taskId: existingTask._id,
        action: "TASK_STATUS_UPDATED",
        metadata: {
          taskKey: existingTask.taskKey,
          taskTitle: existingTask.title,
          fromStatus,
          toStatus: status,
        },
      });
    }

    const populated = await existingTask.populate([
      { path: "assigneeId", select: "name email avatarUrl" },
      { path: "reporterId", select: "name email avatarUrl" },
      { path: "projectId", select: "name key" },
    ]);

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      workspaceId: req.workspaceId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    const previousStatus = task.status;
    const previousPriority = task.priority;
    const previousAssigneeId = task.assigneeId
      ? task.assigneeId.toString()
      : null;
    const previousDueDate = task.dueDate
      ? new Date(task.dueDate).getTime()
      : null;

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "assigneeId",
      "dueDate",
      "tags",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    if (req.body.status && req.body.status !== previousStatus) {
      logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        action: "TASK_STATUS_UPDATED",
        metadata: {
          taskKey: task.taskKey,
          taskTitle: task.title,
          fromStatus: previousStatus,
          toStatus: task.status,
        },
      });
    }

    if (req.body.priority && req.body.priority !== previousPriority) {
      logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        action: "TASK_PRIORITY_UPDATED",
        metadata: {
          taskKey: task.taskKey,
          taskTitle: task.title,
          fromPriority: previousPriority,
          toPriority: task.priority,
        },
      });
    }

    const newAssigneeId = task.assigneeId ? task.assigneeId.toString() : null;
    if (
      req.body.assigneeId !== undefined &&
      newAssigneeId !== previousAssigneeId
    ) {
      let assigneeName = "Unassigned";
      if (task.assigneeId) {
        const assignedUser = await User.findById(task.assigneeId).select(
          "name",
        );
        if (assignedUser) assigneeName = assignedUser.name;
      }

      logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        action: "TASK_ASSIGNEE_UPDATED",
        metadata: {
          taskKey: task.taskKey,
          taskTitle: task.title,
          assigneeName,
        },
      });
    }

    const newDueDate = task.dueDate ? new Date(task.dueDate).getTime() : null;
    if (req.body.dueDate !== undefined && newDueDate !== previousDueDate) {
      logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        action: "TASK_DUE_DATE_UPDATED",
        metadata: {
          taskKey: task.taskKey,
          taskTitle: task.title,
          dueDate: task.dueDate,
        },
      });
    }

    const populated = await task.populate([
      { path: "assigneeId", select: "name email avatarUrl" },
      { path: "reporterId", select: "name email avatarUrl" },
      { path: "projectId", select: "name key" },
    ]);

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

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

    logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      projectId: task.projectId,
      taskId: task._id,
      action: "TASK_DELETED",
      metadata: {
        taskKey: task.taskKey,
        taskTitle: task.title,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
};
