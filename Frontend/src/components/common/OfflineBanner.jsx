import React, { useState } from "react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { WifiOff, RefreshCw, Layers, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { OfflineQueueModal } from "./OfflineQueueModal";

export const OfflineBanner = () => {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);

  // If online and no pending items to sync, don't show banner
  if (isOnline && pendingCount === 0) return null;
  if (isDismissed && isOnline) return null;

  return (
    <>
      <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2.5 shadow-lg border-b border-amber-500/30 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          {/* Status Details */}
          <div className="flex items-center gap-2.5 font-medium">
            {!isOnline ? (
              <span className="flex items-center justify-center p-1 bg-amber-950/40 rounded-lg text-amber-200 ring-1 ring-amber-400/30">
                <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
              </span>
            ) : (
              <span className="flex items-center justify-center p-1 bg-amber-950/40 rounded-lg text-amber-200 ring-1 ring-amber-400/30">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              </span>
            )}

            <div>
              {!isOnline ? (
                <span>
                  <strong className="font-semibold">Offline Mode Active.</strong> You are viewing cached workspace data. Changes will save locally.
                </span>
              ) : (
                <span>
                  <strong className="font-semibold">Back Online!</strong> You have {pendingCount} unsynced change{pendingCount > 1 ? "s" : ""} queued.
                </span>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {pendingCount > 0 && (
              <button
                onClick={() => setShowQueueModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-100 text-xs font-semibold border border-amber-400/30 transition-all duration-150 cursor-pointer"
                title="View queued changes"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Queue ({pendingCount})</span>
              </button>
            )}

            <button
              onClick={triggerSync}
              disabled={!isOnline || isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer ${
                !isOnline
                  ? "bg-amber-800/40 text-amber-200/60 border border-amber-700/30 cursor-not-allowed"
                  : "bg-white text-amber-900 hover:bg-amber-50 active:scale-95 border border-white"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : isOnline ? "Sync Now" : "Waiting for Network"}</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-md hover:bg-amber-700/60 text-amber-200 hover:text-white transition-colors cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showQueueModal && (
        <OfflineQueueModal onClose={() => setShowQueueModal(false)} />
      )}
    </>
  );
};

export default OfflineBanner;
