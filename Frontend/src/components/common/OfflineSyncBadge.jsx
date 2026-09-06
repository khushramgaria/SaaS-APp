import React, { useState } from "react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { Wifi, WifiOff, RefreshCw, Layers } from "lucide-react";
import { OfflineQueueModal } from "./OfflineQueueModal";

export const OfflineSyncBadge = () => {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOnlineStatus();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => (pendingCount > 0 ? setShowModal(true) : triggerSync())}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
            !isOnline
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              : pendingCount > 0
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
          title={
            !isOnline
              ? "You are offline. Click to view offline queue."
              : pendingCount > 0
              ? `${pendingCount} unsynced items. Click to sync or inspect queue.`
              : "Connected & Synced."
          }
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                !isOnline
                  ? "bg-amber-400"
                  : pendingCount > 0
                  ? "bg-indigo-400"
                  : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                !isOnline
                  ? "bg-amber-500"
                  : pendingCount > 0
                  ? "bg-indigo-500"
                  : "bg-emerald-500"
              }`}
            />
          </span>

          <span className="font-semibold truncate max-w-[100px]">
            {!isOnline
              ? "Offline"
              : isSyncing
              ? "Syncing..."
              : pendingCount > 0
              ? `${pendingCount} Pending`
              : "Online"}
          </span>

          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : !isOnline ? (
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Wifi className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
      </div>

      {showModal && <OfflineQueueModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default OfflineSyncBadge;
