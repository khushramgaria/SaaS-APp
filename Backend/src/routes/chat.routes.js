import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getConversations,
  createChannel,
  getOrCreateDirectMessage,
  getMessages,
  markConversationAsRead,
} from "../controllers/chat.controller.js";

const router = Router();

router.use(verifyJWT);

// Conversations list (Channels + DMs)
router.get("/conversations", getConversations);

// Create Channel
router.post("/channels", createChannel);

// Open/Find Direct Message
router.post("/direct", getOrCreateDirectMessage);

// Messages in a conversation
router.get("/conversations/:conversationId/messages", getMessages);

// Mark as read
router.patch("/conversations/:conversationId/read", markConversationAsRead);

export default router;
