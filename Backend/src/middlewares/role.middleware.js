export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure the authentication middleware ran first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before checking permissions.",
      });
    }

    // Ensure workspace context exists
    if (!req.workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Active workspace context is required for this action.",
      });
    }

    // Check if the user's role in this workspace is authorized
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires one of the following roles: [${allowedRoles.join(", ")}]. Your role: ${req.userRole || "NONE"}`,
      });
    }

    next();
  };
};
