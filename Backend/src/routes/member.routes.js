import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import {
  getMembers,
  updateMemberRole,
  removeMember,
  getInvites,
  createInvite,
  resendInvite,
  revokeInvite,
} from "../controllers/member.controller.js";

const router = Router();

router.use(verifyJWT);

/**
 * @openapi
 * /workspaces/members:
 *   get:
 *     summary: List all workspace members
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *     responses:
 *       200:
 *         description: List of team members retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/members", getMembers);

/**
 * @openapi
 * /workspaces/members/{memberId}/role:
 *   patch:
 *     summary: Modify a member's role (OWNER/ADMIN only)
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the WorkspaceMember record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Forbidden (cannot change owner or higher privileges)
 *       404:
 *         description: Member not found
 */
router.patch(
  "/members/:memberId/role",
  requireRoles("OWNER", "ADMIN"),
  updateMemberRole,
);

/**
 * @openapi
 * /workspaces/members/{memberId}:
 *   delete:
 *     summary: Remove a member from the workspace (Unassigns their tasks)
 *     tags: [Workspace Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the WorkspaceMember record
 *     responses:
 *       200:
 *         description: Member removed and their tasks unassigned
 *       403:
 *         description: Forbidden (cannot delete owner)
 *       404:
 *         description: Member not found
 */
router.delete(
  "/members/:memberId",
  requireRoles("OWNER", "ADMIN"),
  removeMember,
);

/**
 * @openapi
 * /workspaces/invites:
 *   get:
 *     summary: List pending and expired invitations
 *     tags: [Workspace Invites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *     responses:
 *       200:
 *         description: List of invitations
 *       403:
 *         description: Forbidden
 */
router.get("/invites", requireRoles("OWNER", "ADMIN"), getInvites);

/**
 * @openapi
 * /workspaces/invites:
 *   post:
 *     summary: Invite a new teammate via email
 *     tags: [Workspace Invites]
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
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *                 example: teammate@example.com
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *                 example: MEMBER
 *     responses:
 *       201:
 *         description: Invitation sent via Nodemailer
 *       409:
 *         description: User already registered in an organization or invite pending
 */
router.post("/invites", requireRoles("OWNER", "ADMIN"), createInvite);

/**
 * @openapi
 * /workspaces/invites/{inviteId}/resend:
 *   post:
 *     summary: Resend invitation email and extend expiration by 48 hours
 *     tags: [Workspace Invites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation refreshed and resent
 *       404:
 *         description: Invite not found
 */
router.post(
  "/invites/:inviteId/resend",
  requireRoles("OWNER", "ADMIN"),
  resendInvite,
);

/**
 * @openapi
 * /workspaces/invites/{inviteId}:
 *   delete:
 *     summary: Revoke an active invitation
 *     tags: [Workspace Invites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite revoked
 *       404:
 *         description: Invite not found
 */
router.delete(
  "/invites/:inviteId",
  requireRoles("OWNER", "ADMIN"),
  revokeInvite,
);

export default router;
