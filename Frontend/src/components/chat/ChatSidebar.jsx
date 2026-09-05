import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setActiveConversationId,
  markConversationAsRead,
  openDirectMessage,
} from "../../redux/slices/chatSlice";
import { Hash, Plus, MessageSquare, Search, User } from "lucide-react";

const ChatSidebar = ({ onOpenCreateChannel, onCloseMobileSidebar }) => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId, onlineUserIds, isLoadingConversations } =
    useSelector((state) => state.chat);
  const { members } = useSelector((state) => state.members);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");

  const channels = conversations.filter((c) => c.type === "CHANNEL");

  const filterItem = (name, email = "") => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
  };

  const handleSelectChannel = (convId) => {
    dispatch(setActiveConversationId(convId));
    dispatch(markConversationAsRead(convId));
    if (onCloseMobileSidebar) onCloseMobileSidebar();
  };

  // Extract all other workspace members except current logged-in user
  const otherMembers = members.filter((m) => {
    const rawUserId = m.userId?._id || m.userId || m.user?._id || m.user;
    const currentId = currentUser?._id;
    return String(rawUserId) !== String(currentId);
  });

  // Handle clicking on a member under Direct Messages
  const handleSelectMember = (member) => {
    const memberUserId = String(member.userId?._id || member.userId || member.user?._id || member.user);

    // Check if a DM conversation already exists with this member
    const existingConv = conversations.find(
      (c) =>
        c.type === "DIRECT" &&
        c.participants &&
        c.participants.some(
          (p) => String(p._id || p) === memberUserId
        )
    );

    if (existingConv) {
      dispatch(setActiveConversationId(existingConv._id));
      dispatch(markConversationAsRead(existingConv._id));
    } else {
      dispatch(openDirectMessage({ recipientId: memberUserId }));
    }

    if (onCloseMobileSidebar) onCloseMobileSidebar();
  };

  return (
    <div className="w-full md:w-72 lg:w-80 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Chat & Channels
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chat..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Channels Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Channels
                </span>
                <button
                  onClick={onOpenCreateChannel}
                  title="Create Channel"
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-0.5">
                {channels
                  .filter((c) => filterItem(c.name || ""))
                  .map((conv) => {
                    const isActive = conv._id === activeConversationId;
                    const hasUnread = conv.unreadCount > 0;

                    return (
                      <button
                        key={conv._id}
                        onClick={() => handleSelectChannel(conv._id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Hash
                            className={`w-4 h-4 flex-shrink-0 ${
                              isActive
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                          <span className="truncate">{conv.name}</span>
                        </div>

                        {hasUnread && (
                          <span className="ml-2 px-2 py-0.5 text-[11px] font-bold bg-indigo-600 text-white rounded-full flex-shrink-0 shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {channels.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
                    No channels yet
                  </div>
                )}
              </div>
            </div>

            {/* Direct Messages Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Direct Messages
                </span>
              </div>

              <div className="space-y-0.5">
                {otherMembers
                  .filter((m) => filterItem(m.name || m.user?.name || "", m.email || m.user?.email || ""))
                  .map((member) => {
                    const memberUserId = String(
                      member.userId?._id || member.userId || member.user?._id || member.user
                    );
                    const memberName = member.name || member.user?.name || member.userId?.name || "Team Member";
                    const memberAvatar = member.avatarUrl || member.user?.avatarUrl || member.userId?.avatarUrl;

                    const isOnline = onlineUserIds.includes(memberUserId);

                    // Find matching conversation if one already exists
                    const existingConv = conversations.find(
                      (c) =>
                        c.type === "DIRECT" &&
                        c.participants &&
                        c.participants.some(
                          (p) => String(p._id || p) === memberUserId
                        )
                    );

                    const isActive = existingConv && existingConv._id === activeConversationId;
                    const unreadCount = existingConv ? existingConv.unreadCount || 0 : 0;

                    return (
                      <button
                        key={member.membershipId || member._id || memberUserId}
                        onClick={() => handleSelectMember(member)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Avatar with status indicator */}
                          <div className="relative flex-shrink-0">
                            {memberAvatar ? (
                              <img
                                src={memberAvatar}
                                alt={memberName}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                {memberName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${
                                isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                          </div>

                          <span className="truncate">{memberName}</span>
                        </div>

                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-[11px] font-bold bg-indigo-600 text-white rounded-full flex-shrink-0 shadow-xs">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {otherMembers.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
                    No other team members available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
