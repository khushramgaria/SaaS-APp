import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { DownloadCloud, RefreshCw, X } from "lucide-react";

export const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("Service Worker registered:", r);
    },
    onRegisterError(error) {
      console.error("Service Worker registration error:", error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl p-4 max-w-sm flex items-start gap-3 backdrop-blur-md bg-slate-900/95">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
          <DownloadCloud className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white">
            App Update Available!
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            A new version of TeamFlow is available. Reload now to get the latest performance and offline features.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => updateServiceWorker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload & Update</span>
            </button>

            <button
              onClick={close}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={close}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
