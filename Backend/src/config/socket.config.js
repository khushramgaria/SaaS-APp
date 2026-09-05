import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

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
