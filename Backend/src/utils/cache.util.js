import { redisClient } from "../config/redis.config.js";

// Get cached JSON or null
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`[Redis Get Error] ${key}:`, error.message);
    return null; // Fail-open: proceed to database if Redis fails
  }
};

// Set cache with TTL (default 10 minutes)
export const setCache = async (key, data, ttlInSeconds = 600) => {
  try {
    await redisClient.set(key, JSON.stringify(data), "EX", ttlInSeconds);
  } catch (error) {
    console.warn(`[Redis Set Error] ${key}:`, error.message);
  }
};

// Delete single or matching keys
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn(`[Redis Del Error] ${key}:`, error.message);
  }
};
