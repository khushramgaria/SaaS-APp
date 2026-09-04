import crypto from "crypto";

// Utility: Token generator (48-hour expiration)
export const generateInviteToken = () => ({
  token: crypto.randomBytes(32).toString("hex"),
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
});
