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
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  username: "default",
  maxRetriesPerRequest: null,
};
