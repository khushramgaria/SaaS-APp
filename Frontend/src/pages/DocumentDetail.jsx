import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  FileText,
  Lock,
  Globe,
  Edit3,
  Trash2,
  Folder,
  Tag,
  User,
  Calendar,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import {
  fetchDocumentById,
  deleteDocument,
  clearCurrentDocument,
} from "../redux/slices/documentSlice";
import ConfirmModal from "../components/common/ConfirmModal";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const DocumentDetail = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentDocument, isLoading, error } = useSelector(
    (state) => state.documents
  );
  const { user } = useSelector((state) => state.auth);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchDocumentById(documentId));

    return () => {
      dispatch(clearCurrentDocument());
    };
  }, [dispatch, documentId]);

  const handleDeleteDocument = async () => {
    if (!documentId) return;
    setIsDeleting(true);
    const result = await dispatch(deleteDocument(documentId));
    setIsDeleting(false);
    if (deleteDocument.fulfilled.match(result)) {
      toast.success("Document deleted successfully");
      navigate("/documents");
    } else {
      toast.error("Failed to delete document.");
    }
  };

  if (isLoading && !currentDocument) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium">Loading document...</p>
      </div>
    );
  }

  if (error || (!isLoading && !currentDocument)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Document Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            This document might have been removed or you do not have permission to access it.
          </p>
          <Button variant="primary" onClick={() => navigate("/documents")}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  const author = currentDocument.authorId || {};
  const project = currentDocument.projectId;
  const allowedMembers = currentDocument.allowedMembers || [];
  const isRestricted = allowedMembers.length > 0;

  // Authorization check for Editing & Deleting
  const isAuthor =
    author._id === user?._id || author === user?._id;
  const canEdit =
    isAuthor || user?.role === "OWNER" || user?.role === "ADMIN";

  const isExplicitlyAllowed =
    !isRestricted ||
    isAuthor ||
    allowedMembers.some((m) => (typeof m === "object" ? m._id : m) === user?._id) ||
    user?.role === "OWNER" ||
    user?.role === "ADMIN";

  if (!isExplicitlyAllowed) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center">
          <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-400 mb-6">
            You do not have authorization to view this document.
          </p>
          <Button variant="primary" onClick={() => navigate("/documents")}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-100 transition-colors text-sm px-2.5 py-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Documents</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
            {currentDocument.title}
          </span>
        </div>

        {/* Action Buttons: Edit Document & Delete */}
        <div className="flex items-center space-x-3">
          {canEdit && (
            <button
              onClick={() => navigate(`/documents/${documentId}/edit`)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Document</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Read-Only Content Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Document Header Metadata Card */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 lg:p-8 space-y-4 shadow-xl">
          {/* Title & Visibility Pill */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {currentDocument.title}
            </h1>

            {isRestricted ? (
              <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shrink-0 self-start">
                <Lock className="w-3.5 h-3.5" />
                <span>Restricted ({allowedMembers.length} members)</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0 self-start">
                <Globe className="w-3.5 h-3.5" />
                <span>Public to Workspace</span>
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            {/* Author */}
            <div className="flex items-center space-x-2 pr-4 border-r border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-semibold text-[10px] text-indigo-300">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  author.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <span className="text-slate-300 font-medium">{author.name || "Unknown"}</span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center space-x-1.5 pr-4 border-r border-slate-800/80">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Updated {new Date(currentDocument.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Linked Project */}
            {project && (
              <div className="flex items-center space-x-1.5 pr-4 border-r border-slate-800/80">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-300 font-medium">{project.name}</span>
              </div>
            )}

            {/* Tags */}
            {currentDocument.tags?.length > 0 && (
              <div className="flex items-center space-x-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                {currentDocument.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Read-Only HTML Body Content Container */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 lg:p-10 shadow-xl">
          {currentDocument.content ? (
            <div
              className="prose-content max-w-none text-slate-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentDocument.content }}
            />
          ) : (
            <p className="text-slate-500 italic text-sm py-8 text-center">
              This document does not have any content yet. Click "Edit Document" to add text.
            </p>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteDocument}
        title="Delete Document?"
        description={`Are you sure you want to delete "${currentDocument.title}"? This action cannot be undone.`}
        confirmText="Delete Document"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DocumentDetail;
