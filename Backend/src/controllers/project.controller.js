import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      workspaceId: req.workspaceId,
      status: "ACTIVE",
    })
      .populate("leadId", "name email avatarUrl")
      .populate("members", "name email avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, key, leadId, members } = req.body;

    if (!name || !key) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Key are required." });
    }

    const formattedKey = key.toUpperCase().trim();

    const existingProject = await Project.findOne({
      workspaceId: req.workspaceId,
      key: formattedKey,
    });

    if (existingProject) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Project key already exists in this workspace.",
        });
    }

    const project = await Project.create({
      workspaceId: req.workspaceId,
      name,
      description: description || "",
      key: formattedKey,
      leadId: leadId || req.user._id,
      members: members && members.length > 0 ? members : [req.user._id],
    });

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      workspaceId: req.workspaceId,
    })
      .populate("leadId", "name email avatarUrl")
      .populate("members", "name email avatarUrl");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // Pipeline metrics for the Overview Tab
    const stats = await Task.aggregate([
      { $match: { projectId: project._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      TOTAL: 0,
    };

    stats.forEach((s) => {
      formattedStats[s._id] = s.count;
      formattedStats.TOTAL += s.count;
    });

    return res.status(200).json({
      success: true,
      data: { project, stats: formattedStats },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectMembers = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { members } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, workspaceId: req.workspaceId },
      { $set: { members } },
      { new: true },
    ).populate("members", "name email avatarUrl");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};
