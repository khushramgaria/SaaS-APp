// IndexedDB / LocalStorage utility for managing offline request queues and background sync

const QUEUE_KEY = "teamflow_offline_queue";

// Listener collection for state changes
const listeners = new Set();

const notifyListeners = (queue) => {
  listeners.forEach((listener) => listener(queue));
};

export const subscribeOfflineQueue = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getOfflineQueue = () => {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read offline queue:", error);
    return [];
  }
};

const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    notifyListeners(queue);
  } catch (error) {
    console.error("Failed to save offline queue:", error);
  }
};

export const addToOfflineQueue = (item) => {
  const queue = getOfflineQueue();
  const newItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    status: "pending", // pending, processing, failed
    attempts: 0,
    ...item,
  };

  const updated = [newItem, ...queue];
  saveOfflineQueue(updated);
  return newItem;
};

export const removeFromOfflineQueue = (id) => {
  const queue = getOfflineQueue();
  const updated = queue.filter((item) => item.id !== id);
  saveOfflineQueue(updated);
};

export const clearOfflineQueue = () => {
  saveOfflineQueue([]);
};

export const updateQueueItemStatus = (id, status, lastError = null) => {
  const queue = getOfflineQueue();
  const updated = queue.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        attempts: (item.attempts || 0) + 1,
        lastError: lastError ? String(lastError) : item.lastError,
      };
    }
    return item;
  });
  saveOfflineQueue(updated);
};

// Process all pending items in the offline queue when reconnected
export const processOfflineQueue = async (apiClient, onProgress = null) => {
  const queue = getOfflineQueue();
  const pendingItems = queue.filter((item) => item.status !== "processing");

  if (pendingItems.length === 0) return { success: 0, failed: 0 };

  let successCount = 0;
  let failCount = 0;

  for (const item of pendingItems) {
    updateQueueItemStatus(item.id, "processing");
    if (onProgress) onProgress(item);

    try {
      const config = {
        method: item.method || "POST",
        url: item.url,
        data: item.payload,
        headers: item.headers || {},
      };

      await apiClient(config);
      removeFromOfflineQueue(item.id);
      successCount++;
    } catch (err) {
      failCount++;
      const errorMessage = err?.message || err?.data?.message || "Sync failed";
      if (item.attempts >= 3) {
        updateQueueItemStatus(item.id, "failed", errorMessage);
      } else {
        updateQueueItemStatus(item.id, "pending", errorMessage);
      }
    }
  }

  return { success: successCount, failed: failCount };
};
