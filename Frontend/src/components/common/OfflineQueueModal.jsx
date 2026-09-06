import React from "react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import {
  removeFromOfflineQueue,
  clearOfflineQueue,
} from "../../services/offlineSyncService";
import {
  X,
  RefreshCw,
  Trash2,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import toast from "react-hot-toast";

export const OfflineQueueModal = ({ onClose }) => {
  const { isOnline, queue, pendingCount, isSyncing, triggerSync } =
    useOnlineStatus();

  const handleRemove = (id) => {
    removeFromOfflineQueue(id);
    toast.success("Removed action from sync queue.");
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all queued offline items? Unsynthed changes will be discarded."
      )
    ) {
      clearOfflineQueue();
      toast.success("Offline sync queue cleared.");
      onClose();
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Offline Action Queue
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30">
                  {pendingCount} Pending
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Changes saved locally while offline. Syncs automatically when connected.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / List */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {queue.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                All Changes Synced!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                There are no pending offline mutations queued for sync.
              </p>
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider shrink-0 ${
                      item.method === "POST"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : item.method === "PUT" || item.method === "PATCH"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {item.method || "POST"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono">
                      {item.url}
                    </p>

                    {item.payload && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Payload: {JSON.stringify(item.payload)}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                      </span>
                      <span>• Attempts: {item.attempts || 0}</span>
                      {item.lastError && (
                        <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1 truncate">
                          <AlertCircle className="w-3 h-3" /> {item.lastError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          {queue.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear Queue
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={triggerSync}
              disabled={!isOnline || isSyncing || queue.length === 0}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all duration-150 cursor-pointer ${
                !isOnline || queue.length === 0
                  ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60"
                  : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/30 active:scale-95"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing Queue..." : "Sync All Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineQueueModal;
