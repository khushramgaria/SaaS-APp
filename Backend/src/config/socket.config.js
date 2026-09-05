import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

let io = null;

const workspaceOnlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // 1. JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded?._id) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const user = await User.findById(decoded._id).select(
        "_id name email avatarUrl",
      );
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected : ${socket.user.email} : ${socket.id}`);

    const userId = socket.user._id.toString();

    // Personal room for notifications/direct pings
    socket.join(`user:${userId}`);

    // Join Workspace & Track Online Presence
    socket.on("join_workspace", (workspaceId) => {
      if (!workspaceId) return;

      socket.workspaceId = workspaceId;
      socket.join(`workspace:${workspaceId}`);

      // Initialize map for workspace if missing
      if (!workspaceOnlineUsers.has(workspaceId)) {
        workspaceOnlineUsers.set(workspaceId, new Map());
      }

      const usersMap = workspaceOnlineUsers.get(workspaceId);

      // Track socket instances for this user
      if (!usersMap.has(userId)) {
        usersMap.set(userId, new Set());
      }
      usersMap.get(userId).add(socket.id);

      // Broadcast updated online user ID array to everyone in the workspace
      const onlineUserIds = Array.from(usersMap.keys());
      io.to(`workspace:${workspaceId}`).emit("online_users", onlineUserIds);
    });

    // Conversation Room: Join when user opens chat thread
    socket.on("join_conversation", (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    // Conversation Room: Leave when user navigates away
    socket.on("leave_conversation", (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Real-Time Message Dispatch
    socket.on("send_message", async ({ conversationId, content }) => {
      try {
        if (!conversationId || !content || !content.trim()) return;

        // Verify participant access
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (!conversation) {
          socket.emit("chat_error", { message: "Access denied to conversation." });
          return;
        }

        // 1. Create message with sender auto-added to readBy
        const message = await Message.create({
          conversationId,
          workspaceId: conversation.workspaceId,
          senderId: socket.user._id,
          content: content.trim(),
          readBy: [socket.user._id],
        });

        // 2. Update conversation lastMessage & lastMessageAt
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        const populatedMessage = await message.populate(
          "senderId",
          "name email avatarUrl"
        );

        // 3. Broadcast message to everyone inside the conversation room
        io.to(`conversation:${conversationId}`).emit("new_message", populatedMessage);

        // 4. Notify all participants (updates sidebar snippet, sorting & unread count)
        conversation.participants.forEach((participantId) => {
          io.to(`user:${participantId.toString()}`).emit("conversation_updated", {
            conversationId,
            lastMessage: populatedMessage,
            lastMessageAt: message.createdAt,
          });
        });
      } catch (error) {
        console.error("Socket send_message error:", error);
        socket.emit("chat_error", { message: "Failed to send message." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket Disconnected]: ${socket.user.name} (${socket.id})`);

      const workspaceId = socket.workspaceId;
      if (workspaceId && workspaceOnlineUsers.has(workspaceId)) {
        const usersMap = workspaceOnlineUsers.get(workspaceId);

        if (usersMap.has(userId)) {
          const userSockets = usersMap.get(userId);
          userSockets.delete(socket.id);

          // If user has no other tabs open, remove them from online map
          if (userSockets.size === 0) {
            usersMap.delete(userId);
          }
        }

        // Clean up empty workspace entry
        if (usersMap.size === 0) {
          workspaceOnlineUsers.delete(workspaceId);
        }

        // Broadcast updated list
        const onlineUserIds = usersMap ? Array.from(usersMap.keys()) : [];
        io.to(`workspace:${workspaceId}`).emit("online_users", onlineUserIds);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
