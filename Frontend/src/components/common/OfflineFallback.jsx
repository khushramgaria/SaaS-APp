import React from "react";
import { WifiOff, RefreshCw, Layers } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export const OfflineFallback = ({
  title = "You are currently offline",
  message = "This feature or page content requires an active network connection or hasn't been cached yet.",
  onRetry,
}) => {
  const { isOnline, isSyncing, triggerSync } = useOnlineStatus();

  return (
    <div className="w-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5">
        <WifiOff className="w-8 h-8 animate-pulse" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
        {message}
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => {
            if (onRetry) onRetry();
            triggerSync();
          }}
          disabled={!isOnline || isSyncing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 cursor-pointer ${
            !isOnline
              ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30 active:scale-95"
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isOnline ? "Retry Request" : "Reconnect & Retry"}</span>
        </button>
      </div>

      {!isOnline && (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-4 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Showing fallback layout until connection returns
        </span>
      )}
    </div>
  );
};

export default OfflineFallback;
