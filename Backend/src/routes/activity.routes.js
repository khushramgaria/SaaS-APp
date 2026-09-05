import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import {
  getWorkspaceActivities,
  getProjectActivities,
} from "../controllers/activity.controller.js";

const router = Router();

router.use(verifyJWT);

/**
 * @openapi
 * /activities:
 *   get:
 *     summary: Get workspace-wide audit logs & activity feed
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of activities per page
 *     responses:
 *       200:
 *         description: List of workspace activity logs
 *       403:
 *         description: Restricted to OWNER and ADMIN
 */
router.get("/", requireRoles("OWNER", "ADMIN"), getWorkspaceActivities);

/**
 * @openapi
 * /activities/projects/{projectId}:
 *   get:
 *     summary: Get recent activity logs for a specific project
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the project
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Maximum number of recent activities
 *     responses:
 *       200:
 *         description: Scoped list of project activities
 *       404:
 *         description: Project not found
 */
router.get("/projects/:projectId", getProjectActivities);

export default router;
