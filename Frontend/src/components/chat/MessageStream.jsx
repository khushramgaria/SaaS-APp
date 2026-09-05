import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMessages } from "../../redux/slices/chatSlice";
import { sendMessage } from "../../services/socket";
import { Hash, Send, User, Menu, ArrowDown, Users } from "lucide-react";
import ChannelMembersModal from "./ChannelMembersModal";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateSeparator = (dateStr) => {
  if (!dateStr) return "";
  const messageDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

const MessageStream = ({ onToggleMobileSidebar }) => {
  const dispatch = useDispatch();
  const {
    conversations,
    activeConversationId,
    messages,
    pagination,
    isLoadingMessages,
    isLoadingMoreMessages,
    onlineUserIds,
  } = useSelector((state) => state.chat);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [inputContent, setInputContent] = useState("");
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const previousScrollHeightRef = useRef(0);

  const activeConv = conversations.find((c) => c._id === activeConversationId);

  // Reliable Auto-scroll to bottom function
  const scrollToBottom = (behavior = "auto") => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // When active conversation changes, reset scroll button and prepare
  useEffect(() => {
    setShowScrollBottomBtn(false);
  }, [activeConversationId]);

  // Initial scroll to bottom when switching conversation or receiving first page of messages
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0 && pagination.page === 1) {
      scrollToBottom("auto");
      setShowScrollBottomBtn(false);

      // Timeout backup to handle DOM layout calculation after image/font paint
      const timer = setTimeout(() => {
        scrollToBottom("auto");
        setShowScrollBottomBtn(false);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [activeConversationId, isLoadingMessages, messages, pagination.page]);

  // Adjust scroll position after prepending older messages from infinite scroll
  useEffect(() => {
    if (previousScrollHeightRef.current > 0 && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - previousScrollHeightRef.current;
      containerRef.current.scrollTop = diff;
      previousScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  // Handle Scroll: detect scroll up for infinite loading & toggle scroll to bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Show button if scrolled up away from bottom (> 150px)
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottomBtn(isScrolledUp);

    // Infinite scroll up trigger (top threshold 60px)
    if (
      scrollTop < 60 &&
      pagination.page < pagination.totalPages &&
      !isLoadingMoreMessages &&
      !isFetchingMoreRef.current
    ) {
      isFetchingMoreRef.current = true;
      previousScrollHeightRef.current = scrollHeight;

      dispatch(
        fetchMessages({
          conversationId: activeConversationId,
          page: pagination.page + 1,
          limit: 15,
        })
      ).finally(() => {
        isFetchingMoreRef.current = false;
      });
    }
  };

  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-6 text-center">
        <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
          <Hash className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Select a Conversation
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Choose a channel or direct message from the sidebar to start chatting with your team.
        </p>
      </div>
    );
  }

  const isChannel = activeConv.type === "CHANNEL";

  // Find DM recipient if direct message
  const getDMRecipient = () => {
    if (!activeConv.participants || !Array.isArray(activeConv.participants)) return null;
    return (
      activeConv.participants.find((p) => p._id !== currentUser?._id) ||
      activeConv.participants[0]
    );
  };

  const dmRecipient = !isChannel ? getDMRecipient() : null;
  const isRecipientOnline = dmRecipient ? onlineUserIds.includes(dmRecipient._id) : false;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    sendMessage({
      conversationId: activeConversationId,
      content: inputContent,
    });

    setInputContent("");
    setTimeout(() => scrollToBottom("smooth"), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Group messages by date
  const groupedMessages = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const dateStr = formatDateSeparator(msg.createdAt);
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({ type: "date", label: dateStr, id: `date-${msg._id}` });
    }
    groupedMessages.push({ type: "message", data: msg, id: msg._id });
  });

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/80 min-w-0">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {isChannel ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Hash className="w-5 h-5 flex-shrink-0" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {activeConv.name}
                </h2>
                {activeConv.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeConv.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                {dmRecipient?.avatarUrl ? (
                  <img
                    src={dmRecipient.avatarUrl}
                    alt={dmRecipient.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {dmRecipient?.name ? (
                      dmRecipient.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    isRecipientOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {dmRecipient?.name || "Direct Message"}
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isRecipientOnline ? "Active Now" : "Offline"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Action: Channel Members Button */}
        {isChannel && (
          <button
            onClick={() => setIsMembersModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/60"
          >
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{activeConv.participants?.length || 0} Members</span>
          </button>
        )}
      </div>

      {/* Message Feed Area */}
      {isLoadingMessages ? (
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
          {[
            { isMe: false, nameW: "w-24", bubbleW: "w-1/2", bubbleH: "h-10" },
            { isMe: true, nameW: "w-16", bubbleW: "w-1/3", bubbleH: "h-9" },
            { isMe: false, nameW: "w-28", bubbleW: "w-3/5", bubbleH: "h-16" },
            { isMe: true, nameW: "w-16", bubbleW: "w-2/5", bubbleH: "h-10" },
            { isMe: false, nameW: "w-20", bubbleW: "w-1/3", bubbleH: "h-9" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 animate-pulse ${
                item.isMe ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex-shrink-0 ${
                  item.isMe
                    ? "bg-indigo-300/40 dark:bg-indigo-900/50"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
              <div
                className={`space-y-1.5 flex-1 flex flex-col ${
                  item.isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`h-3 bg-slate-200 dark:bg-slate-800/80 rounded ${item.nameW}`}
                />
                <div
                  className={`${item.bubbleW} ${item.bubbleH} rounded-2xl ${
                    item.isMe
                      ? "bg-indigo-500/20 dark:bg-indigo-600/30 rounded-tr-xs"
                      : "bg-slate-200 dark:bg-slate-800/90 rounded-tl-xs"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            {isChannel ? <Hash className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Welcome to {isChannel ? `#${activeConv.name}` : dmRecipient?.name || "Direct Message"}!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            This is the start of your message history. Send a message to start the conversation.
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
        >
          {/* Top skeleton loader for fetching older messages */}
          {isLoadingMoreMessages && (
            <div className="space-y-4 py-2 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800/80 rounded w-20" />
                  <div className="h-9 bg-slate-200 dark:bg-slate-800/90 rounded-2xl rounded-tl-xs w-1/2" />
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-indigo-300/40 dark:bg-indigo-900/50 flex-shrink-0" />
                <div className="space-y-1.5 flex-1 flex flex-col items-end">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800/80 rounded w-16" />
                  <div className="h-9 bg-indigo-500/20 dark:bg-indigo-600/30 rounded-2xl rounded-tr-xs w-1/3" />
                </div>
              </div>
            </div>
          )}

          {groupedMessages.map((item) => {
            if (item.type === "date") {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-center my-4"
                >
                  <span className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full shadow-2xs">
                    {item.label}
                  </span>
                </div>
              );
            }

            const msg = item.data;
            const sender = msg.senderId || {};
            const isMe = sender._id === currentUser?._id;

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 group ${
                  isMe ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {sender.avatarUrl ? (
                    <img
                      src={sender.avatarUrl}
                      alt={sender.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-800">
                      {sender.name ? sender.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                  )}
                </div>

                {/* Content Bubble */}
                <div
                  className={`max-w-[75%] md:max-w-[65%] flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isMe ? "You" : sender.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Scroll to Bottom Arrow Button */}
      {showScrollBottomBtn && !isLoadingMessages && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-full shadow-lg border border-indigo-400/30 transition-all animate-bounce"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Scroll to bottom</span>
        </button>
      )}

      {/* Message Input Box */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex-shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isChannel
                ? `Message #${activeConv.name}`
                : `Message ${dmRecipient?.name || ""}`
            }
            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />

          <button
            type="submit"
            disabled={!inputContent.trim()}
            className="absolute right-2.5 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-xs flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Channel Members Modal */}
      <ChannelMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        channel={activeConv}
      />
    </div>
  );
};

export default MessageStream;
