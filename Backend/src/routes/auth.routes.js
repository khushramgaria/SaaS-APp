import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  getMe,
  getInviteDetails,
  acceptInvite,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register account and initialize workspace
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, workspaceName]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret@123
 *               workspaceName:
 *                 type: string
 *                 example: Acme Corp
 *     responses:
 *       201:
 *         description: Workspace and account registered successfully
 *       409:
 *         description: Email already registered
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log into an existing account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret@123
 *     responses:
 *       200:
 *         description: Login successful, returns tokens and workspaces
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", refreshToken);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Fetch current authenticated profile and workspaces
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *     responses:
 *       200:
 *         description: Profile data retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/me", verifyJWT, getMe);

/**
 * @openapi
 * /auth/invites/{token}:
 *   get:
 *     summary: Verify invitation token validity for signup page
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Valid token, returns metadata (email, role, workspaceName)
 *       404:
 *         description: Invalid link
 *       410:
 *         description: Invitation link expired
 */
router.get("/invites/:token", getInviteDetails);

/**
 * @openapi
 * /auth/invites/{token}/accept:
 *   post:
 *     summary: Accept invite, create user account, and join workspace
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Morgan
 *               password:
 *                 type: string
 *                 example: SecurePass@123
 *     responses:
 *       201:
 *         description: Account initialized and logged in
 *       400:
 *         description: Invalid or expired token
 */
router.post("/invites/:token/accept", acceptInvite);

export default router;
