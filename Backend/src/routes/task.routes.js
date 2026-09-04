import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();
router.use(verifyJWT);

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List and filter workspace tasks (Global or Project Scoped)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered tasks list
 *   post:
 *     summary: Create a task in a project
 *     tags: [Tasks]
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
 *             required: [projectId, title]
 *             properties:
 *               projectId:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: Build landing page
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE]
 *               assigneeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.get("/", getTasks);
router.post("/", requireRoles("OWNER", "ADMIN", "MEMBER"), createTask);

/**
 * @openapi
 * /tasks/{taskId}/status:
 *   patch:
 *     summary: Update task column status (Kanban Drag & Drop)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task status updated
 */
router.patch(
  "/:taskId/status",
  requireRoles("OWNER", "ADMIN", "MEMBER"),
  updateTaskStatus,
);

/**
 * @openapi
 * /tasks/{taskId}:
 *   patch:
 *     summary: Update task details
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.patch("/:taskId", requireRoles("OWNER", "ADMIN", "MEMBER"), updateTask);
router.delete("/:taskId", requireRoles("OWNER", "ADMIN", "MEMBER"), deleteTask);

export default router;
