import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProjectMembers,
} from "../controllers/project.controller.js";

const router = Router();
router.use(verifyJWT);

/**
 * @openapi
 * /projects:
 *   get:
 *     summary: Get all active projects in the workspace
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *     responses:
 *       200:
 *         description: List of projects
 *   post:
 *     summary: Create a new project (OWNER/ADMIN only)
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, key]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Core Web App
 *               key:
 *                 type: string
 *                 example: CORE
 *               description:
 *                 type: string
 *                 example: Customer-facing dashboard portal
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Project created
 *       409:
 *         description: Key already exists
 */
router.get("/", getProjects);
router.post("/", requireRoles("OWNER", "ADMIN"), createProject);

/**
 * @openapi
 * /projects/{projectId}:
 *   get:
 *     summary: Get project details and status metrics
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details and task count metrics
 *       404:
 *         description: Not found
 */
router.get("/:projectId", getProjectById);

/**
 * @openapi
 * /projects/{projectId}/members:
 *   patch:
 *     summary: Assign members to a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members updated
 */
router.patch(
  "/:projectId/members",
  requireRoles("OWNER", "ADMIN"),
  updateProjectMembers,
);

export default router;
