import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../services/Cloudinary.service.js";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyJWT);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *   patch:
 *     summary: Update profile name
 *     tags: [Users]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Khush
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

/**
 * @openapi
 * /users/avatar:
 *   patch:
 *     summary: Upload and update user avatar (Cloudinary)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated with secure Cloudinary URL
 */
router.patch("/avatar", upload.single("avatar"), updateAvatar);

/**
 * @openapi
 * /users/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Users]
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
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password successfully updated
 *       400:
 *         description: Incorrect current password or invalid payload
 */
router.patch("/change-password", changePassword);

export default router;
