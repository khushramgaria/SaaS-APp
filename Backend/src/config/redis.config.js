import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Main Redis client for caching
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on("connect", () => {
  console.log("[Redis]: Connected successfully");
});

redisClient.on("error", (err) => {
  console.error("[Redis Error]:", err.message);
});

// Reusable BullMQ connection configuration
export const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};
