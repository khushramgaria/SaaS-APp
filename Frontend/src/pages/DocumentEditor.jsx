import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  Folder,
  Lock,
  Globe,
  Tag,
  Save,
  X,
  Plus,
} from "lucide-react";
import {
  fetchDocumentById,
  createDocument,
  updateDocument,
} from "../redux/slices/documentSlice";
import { fetchProjects } from "../redux/slices/projectSlice";
import { fetchMembers } from "../redux/slices/memberSlice";
import RichTextEditor from "../components/documents/RichTextEditor";
import DocAccessModal from "../components/documents/DocAccessModal";
import toast from "react-hot-toast";

const DocumentEditor = () => {
  const { documentId } = useParams();
  const isEditMode = Boolean(documentId);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { currentDocument, isSaving } = useSelector(
    (state) => state.documents
  );
  const { projects } = useSelector((state) => state.projects);
  const { members } = useSelector((state) => state.members);

  // Initial metadata from state if creating new document
  const passedMetadata = location.state?.metadata || {};

  const [title, setTitle] = useState(passedMetadata.title || "Untitled Document");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState(passedMetadata.projectId || "");
  const [tags, setTags] = useState(passedMetadata.tags || []);
  const [allowedMembers, setAllowedMembers] = useState(passedMetadata.allowedMembers || []);

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMembers());

    if (isEditMode && documentId) {
      dispatch(fetchDocumentById(documentId));
    }
  }, [dispatch, isEditMode, documentId]);

  // Sync state if editing existing document
  useEffect(() => {
    if (isEditMode && currentDocument && currentDocument._id === documentId) {
      setTitle(currentDocument.title || "");
      setContent(currentDocument.content || "");
      setProjectId(
        typeof currentDocument.projectId === "object"
          ? currentDocument.projectId?._id || ""
          : currentDocument.projectId || ""
      );
      setTags(currentDocument.tags || []);
      setAllowedMembers(currentDocument.allowedMembers || []);
    }
  }, [isEditMode, currentDocument, documentId]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      e.preventDefault();
      const trimmed = newTagInput.trim().replace(/^#/, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setNewTagInput("");
      }
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveDocument = async () => {
    if (!title.trim()) {
      toast.error("Please provide a document title.");
      return;
    }

    const payload = {
      title: title.trim(),
      content,
      projectId: projectId || null,
      allowedMembers,
      tags,
    };

    if (isEditMode) {
      const result = await dispatch(updateDocument({ documentId, ...payload }));
      if (updateDocument.fulfilled.match(result)) {
        toast.success("Document updated successfully!");
        navigate(`/documents/${documentId}`);
      } else {
        toast.error("Failed to update document.");
      }
    } else {
      const result = await dispatch(createDocument(payload));
      if (createDocument.fulfilled.match(result)) {
        toast.success("Document created successfully!");
        const newDoc = result.payload.data;
        if (newDoc?._id) {
          navigate(`/documents/${newDoc._id}`);
        } else {
          navigate("/documents");
        }
      } else {
        toast.error("Failed to create document.");
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/documents/${documentId}`);
    } else {
      navigate("/documents");
    }
  };

  const isRestricted = allowedMembers.length > 0;
  const linkedProject = projects.find((p) => p._id === projectId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Documents</span>
          </button>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
            {isEditMode ? `Edit / ${title}` : "New Document"}
          </span>

          {linkedProject && (
            <span className="hidden sm:inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-medium">
              <Folder className="w-3 h-3" />
              <span>{linkedProject.name}</span>
            </span>
          )}
        </div>

        {/* Right Actions: Cancel & Save Document */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveDocument}
            disabled={isSaving || !title.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-colors flex items-center space-x-2 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Document"}</span>
          </button>
        </div>
      </header>

      {/* Main Composition Workspace */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Document Metadata Strip */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          {/* Editable Document Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title..."
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-2xl font-bold text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* Project, Access, and Tags Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {/* Linked Project Dropdown */}
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="">No Project (General)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Access Permissions Pill / Trigger */}
            <button
              type="button"
              onClick={() => setIsAccessModalOpen(true)}
              className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                isRestricted
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isRestricted ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Restricted ({allowedMembers.length})</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Workspace Public</span>
                </>
              )}
            </button>

            {/* Tags Strip */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md text-[11px]"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={handleAddTag}
                  placeholder="tag name..."
                  autoFocus
                  className="bg-slate-50 dark:bg-slate-950 border border-indigo-500 text-slate-900 dark:text-slate-200 text-[11px] rounded px-2 py-0.5 w-24 focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center space-x-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-[11px] py-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add tag</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TipTap Rich Text Editor Container */}
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Compose HTML document content, notes, or specifications..."
        />
      </main>

      {/* Permissions Modal */}
      <DocAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        allowedMembers={allowedMembers}
        onSave={(newAllowed) => setAllowedMembers(newAllowed)}
        members={members}
        isLoading={false}
      />
    </div>
  );
};

export default DocumentEditor;
