import { Activity } from "../models/activity.model.js";

// 1. Get workspace-wide activity feed (paginated)
export const getWorkspaceActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const filter = { workspaceId: req.workspaceId };

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate("userId", "name email avatarUrl")
        .populate("projectId", "name key")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get activities scoped to a specific project (e.g. for Project Overview tab)
export const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const filter = {
      workspaceId: req.workspaceId,
      projectId,
    };

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate("userId", "name email avatarUrl")
        .populate("projectId", "name key")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
