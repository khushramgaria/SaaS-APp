import { useState, useEffect, useCallback } from "react";
import {
  getOfflineQueue,
  subscribeOfflineQueue,
  processOfflineQueue,
} from "../services/offlineSyncService";
import apiClient from "../utils/api";
import toast from "react-hot-toast";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [queue, setQueue] = useState(getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  // Subscribe to offline queue changes
  useEffect(() => {
    const unsubscribe = subscribeOfflineQueue((updatedQueue) => {
      setQueue(updatedQueue);
    });
    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    const currentQueue = getOfflineQueue();
    if (currentQueue.length === 0) return;

    setIsSyncing(true);
    const toastId = toast.loading(`Syncing ${currentQueue.length} offline item(s)...`);

    try {
      const result = await processOfflineQueue(apiClient);
      if (result.success > 0) {
        toast.success(`Successfully synced ${result.success} offline item(s)!`, {
          id: toastId,
        });
      } else if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} item(s). Will retry.`, {
          id: toastId,
        });
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.error("Failed to complete offline sync.", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Network connection restored!", {
        icon: "🌐",
        duration: 3000,
      });

      // Auto sync queued offline actions on reconnect
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error("You are currently offline. Local cache enabled.", {
        icon: "📡",
        duration: 4000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [triggerSync]);

  return {
    isOnline,
    wasOffline,
    queue,
    pendingCount: queue.filter((item) => item.status !== "processing").length,
    isSyncing,
    triggerSync,
  };
};

export default useOnlineStatus;
