import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";

// 1. Get all conversations (Channels + Direct Messages) with unread counts
export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Find all conversations in the workspace where user is a participant
    const conversations = await Conversation.find({
      workspaceId: req.workspaceId,
      participants: currentUserId,
    })
      .populate("participants", "name email avatarUrl")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "name" },
      })
      .sort({ lastMessageAt: -1 });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          readBy: { $ne: currentUserId },
        });

        const convObj = conv.toObject();
        return {
          ...convObj,
          unreadCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Create a Channel
export const createChannel = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Channel name is required.",
      });
    }

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");

    // Check if channel name already exists in this workspace
    const existing = await Conversation.findOne({
      workspaceId: req.workspaceId,
      name: cleanName,
      type: "CHANNEL",
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A channel with this name already exists in this workspace.",
      });
    }

    // Default: Add all workspace members into public channels
    const workspaceMembers = await WorkspaceMember.find({
      workspaceId: req.workspaceId,
    }).select("userId");

    const participants = workspaceMembers.map((m) => m.userId);
    if (!participants.some((id) => id.equals(req.user._id))) {
      participants.push(req.user._id);
    }

    const channel = await Conversation.create({
      workspaceId: req.workspaceId,
      type: "CHANNEL",
      name: cleanName,
      description: description?.trim() || "",
      participants,
      createdBy: req.user._id,
      lastMessageAt: new Date(),
    });

    const populated = await channel.populate(
      "participants",
      "name email avatarUrl",
    );

    return res.status(201).json({
      success: true,
      data: {
        ...populated.toObject(),
        unreadCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Open or Find 1:1 Direct Message Conversation
export const getOrCreateDirectMessage = async (req, res, next) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required.",
      });
    }

    if (req.user._id.equals(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a direct conversation with yourself.",
      });
    }

    // Verify recipient belongs to this workspace
    const recipientMember = await WorkspaceMember.findOne({
      workspaceId: req.workspaceId,
      userId: recipientId,
    });

    if (!recipientMember) {
      return res.status(404).json({
        success: false,
        message: "Recipient is not a member of this workspace.",
      });
    }

    // Check if DM thread already exists between these 2 users
    let conversation = await Conversation.findOne({
      workspaceId: req.workspaceId,
      type: "DIRECT",
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    })
      .populate("participants", "name email avatarUrl")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "name" },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        workspaceId: req.workspaceId,
        type: "DIRECT",
        participants: [req.user._id, recipientId],
        createdBy: req.user._id,
        lastMessageAt: new Date(),
      });

      await conversation.populate("participants", "name email avatarUrl");
    }

    const unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      readBy: { $ne: req.user._id },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...conversation.toObject(),
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Paginated Messages for an Active Conversation
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Verify conversation access
    const conversation = await Conversation.findOne({
      _id: conversationId,
      workspaceId: req.workspaceId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied.",
      });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .populate("senderId", "name email avatarUrl")
        .sort({ createdAt: -1 }) // Newest first for pagination
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId }),
    ]);

    // Reverse so client receives chronological order: older -> newer
    return res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
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

// 5. Mark Conversation Messages as Read
export const markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      workspaceId: req.workspaceId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    // Add current user ID to `readBy` on all messages in this conversation
    await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read.",
    });
  } catch (error) {
    next(error);
  }
};
