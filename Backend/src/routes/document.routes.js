import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import {
  getDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../controllers/document.controller.js";

const router = Router();
router.use(verifyJWT);

/**
 * @openapi
 * /documents:
 *   get:
 *     summary: List accessible workspace documents (search & filter)
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 *   post:
 *     summary: Create a new document with HTML content and permissions
 *     tags: [Documents]
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
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Architecture Specs
 *               content:
 *                 type: string
 *                 example: "<h2>Overview</h2><p>Specifications body...</p>"
 *               projectId:
 *                 type: string
 *               allowedMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Document created
 */
router.get("/", getDocuments);
router.post("/", requireRoles("OWNER", "ADMIN", "MEMBER"), createDocument);

/**
 * @openapi
 * /documents/{documentId}:
 *   get:
 *     summary: Retrieve single document body and permissions
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document retrieved
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update document content, title, or permissions
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: documentId
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
 *               content:
 *                 type: string
 *               projectId:
 *                 type: string
 *               allowedMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Document updated
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceHeader'
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.get("/:documentId", getDocumentById);
router.put(
  "/:documentId",
  requireRoles("OWNER", "ADMIN", "MEMBER"),
  updateDocument,
);
router.delete(
  "/:documentId",
  requireRoles("OWNER", "ADMIN", "MEMBER"),
  deleteDocument,
);

export default router;
