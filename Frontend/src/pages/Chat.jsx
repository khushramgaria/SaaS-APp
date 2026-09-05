import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchMessages,
  markConversationAsRead,
  setOnlineUserIds,
  addMessageReceived,
  updateConversationSnippet,
} from "../redux/slices/chatSlice";
import { fetchMembers } from "../redux/slices/memberSlice";
import {
  connectSocket,
  getSocket,
  joinWorkspace,
  joinConversation,
  leaveConversation,
} from "../services/socket";
import ChatSidebar from "../components/chat/ChatSidebar";
import MessageStream from "../components/chat/MessageStream";
import CreateChannelModal from "../components/chat/CreateChannelModal";

const Chat = () => {
  const dispatch = useDispatch();
  const { activeConversationId, conversations } = useSelector(
    (state) => state.chat
  );

  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const prevConversationIdRef = useRef(null);

  // 1. Initialize Socket, fetch Conversations, and fetch Workspace Members
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchMembers());

    const socket = connectSocket();
    const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
    if (activeWorkspaceId) {
      joinWorkspace(activeWorkspaceId);
    }

    // Socket Event Listeners
    const handleOnlineUsers = (userIds) => {
      dispatch(setOnlineUserIds(userIds));
    };

    const handleNewMessage = (message) => {
      dispatch(addMessageReceived(message));
    };

    const handleConversationUpdated = (data) => {
      dispatch(updateConversationSnippet(data));
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("new_message", handleNewMessage);
    socket.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.off("new_message", handleNewMessage);
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [dispatch]);

  // 2. Room Joining & Message Fetching when activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) return;

    // Leave previous room
    if (
      prevConversationIdRef.current &&
      prevConversationIdRef.current !== activeConversationId
    ) {
      leaveConversation(prevConversationIdRef.current);
    }

    // Join new room & fetch messages
    joinConversation(activeConversationId);
    dispatch(fetchMessages({ conversationId: activeConversationId }));
    dispatch(markConversationAsRead(activeConversationId));

    prevConversationIdRef.current = activeConversationId;
  }, [activeConversationId, dispatch]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Desktop & Mobile Sidebar */}
      <div
        className={`${
          isMobileSidebarOpen ? "block" : "hidden"
        } md:block fixed md:relative z-40 inset-y-0 left-0 w-full md:w-auto h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`}
      >
        <ChatSidebar
          onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Message Stream */}
      <MessageStream
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Modals */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
    </div>
  );
};

export default Chat;
