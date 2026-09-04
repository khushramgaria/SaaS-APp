import { Document } from "../models/document.model.js";

// 1. List Documents with Permission Filtering
export const getDocuments = async (req, res, next) => {
  try {
    const { projectId, tag, search } = req.query;

    const filter = {
      workspaceId: req.workspaceId,
      isArchived: false,
    };

    if (projectId) filter.projectId = projectId;
    if (tag) filter.tags = tag;

    if (search) {
      filter.$text = { $search: search };
    }

    // Permission Guard:
    // OWNER and ADMIN view everything.
    // MEMBER/VIEWER view only if allowedMembers is empty, or includes them, or they are the author.
    if (!["OWNER", "ADMIN"].includes(req.userRole)) {
      filter.$or = [
        { allowedMembers: { $size: 0 } },
        { allowedMembers: req.user._id },
        { authorId: req.user._id },
      ];
    }

    const documents = await Document.find(filter)
      .select("-content") // Exclude heavy HTML body in list view
      .populate("authorId", "name email avatarUrl")
      .populate("projectId", "name key")
      .populate("allowedMembers", "name email avatarUrl")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

// 2. Create Document with Content & Permissions
export const createDocument = async (req, res, next) => {
  try {
    const { title, content, projectId, allowedMembers, tags } = req.body;

    const document = await Document.create({
      workspaceId: req.workspaceId,
      authorId: req.user._id,
      title: title || "Untitled Document",
      content: content || "",
      projectId: projectId || null,
      allowedMembers: allowedMembers || [],
      tags: tags || [],
    });

    const populated = await document.populate([
      { path: "authorId", select: "name email avatarUrl" },
      { path: "projectId", select: "name key" },
      { path: "allowedMembers", select: "name email avatarUrl" },
    ]);

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Document by ID
export const getDocumentById = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      workspaceId: req.workspaceId,
      isArchived: false,
    })
      .populate("authorId", "name email avatarUrl")
      .populate("projectId", "name key")
      .populate("allowedMembers", "name email avatarUrl");

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Individual read authorization
    const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(req.userRole);
    const isAuthor = document.authorId._id.equals(req.user._id);
    const isExplicitlyAllowed =
      document.allowedMembers.length === 0 ||
      document.allowedMembers.some((m) => m._id.equals(req.user._id));

    if (!isOwnerOrAdmin && !isAuthor && !isExplicitlyAllowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this document.",
      });
    }

    return res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// 4. Update Document Content & Permissions
export const updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      workspaceId: req.workspaceId,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Only Author, Owner, or Admin can edit
    const canEdit =
      ["OWNER", "ADMIN"].includes(req.userRole) ||
      document.authorId.equals(req.user._id);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Only the author or an admin can edit this document.",
      });
    }

    const allowedUpdates = [
      "title",
      "content",
      "projectId",
      "allowedMembers",
      "tags",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        document[field] = req.body[field];
      }
    });

    await document.save();

    const populated = await document.populate([
      { path: "authorId", select: "name email avatarUrl" },
      { path: "projectId", select: "name key" },
      { path: "allowedMembers", select: "name email avatarUrl" },
    ]);

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Document
export const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      workspaceId: req.workspaceId,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const canDelete =
      ["OWNER", "ADMIN"].includes(req.userRole) ||
      document.authorId.equals(req.user._id);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Only the author or an admin can delete this document.",
      });
    }

    await Document.findByIdAndDelete(documentId);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
