import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openDirectMessage } from "../../redux/slices/chatSlice";
import { X, Search, Users, User, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const ChannelMembersModal = ({ isOpen, onClose, channel }) => {
  const dispatch = useDispatch();
  const { onlineUserIds } = useSelector((state) => state.chat);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");

  if (!isOpen || !channel) return null;

  const participants = channel.participants || [];

  const filteredParticipants = participants.filter((p) => {
    if (!p) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term)
    );
  });

  const handleStartDM = async (participantId) => {
    if (participantId === currentUser?._id) return;
    try {
      await dispatch(openDirectMessage({ recipientId: participantId })).unwrap();
      onClose();
    } catch (err) {
      toast.error(err || "Failed to open direct message");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                #{channel.name} Members
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {participants.length} member{participants.length !== 1 ? "s" : ""} in this channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channel members..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredParticipants.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No members found
            </div>
          ) : (
            filteredParticipants.map((p) => {
              const isOnline = onlineUserIds.includes(p._id);
              const isMe = p._id === currentUser?._id;

              return (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {p.name ? p.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {p.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isMe && (
                      <button
                        onClick={() => handleStartDM(p._id)}
                        title="Send Direct Message"
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        isOnline
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelMembersModal;
