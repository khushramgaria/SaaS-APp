import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Lock,
  Globe,
  Tag,
  Folder,
  X,
  Trash2,
} from "lucide-react";
import {
  fetchDocuments,
  deleteDocument,
} from "../redux/slices/documentSlice";
import { fetchProjects } from "../redux/slices/projectSlice";
import { fetchMembers } from "../redux/slices/memberSlice";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/common/ConfirmModal";
import CreateDocModal from "../components/documents/CreateDocModal";

const Documents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { documents, isLoading } = useSelector((state) => state.documents);
  const { projects } = useSelector((state) => state.projects);
  const { members } = useSelector((state) => state.members);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");

  // Create Document Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchProjects());
    dispatch(fetchMembers());
  }, [dispatch]);

  // Extract all unique tags across documents
  const allTags = useMemo(() => {
    const set = new Set();
    documents.forEach((doc) => {
      doc.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !searchTerm.trim() ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProject =
        selectedProjectId === "ALL" ||
        (selectedProjectId === "NONE" && !doc.projectId) ||
        (doc.projectId?._id || doc.projectId) === selectedProjectId;

      const matchesTag =
        selectedTag === "ALL" || doc.tags?.includes(selectedTag);

      return matchesSearch && matchesProject && matchesTag;
    });
  }, [documents, searchTerm, selectedProjectId, selectedTag]);

  const handleContinueToEditor = (metadata) => {
    setIsCreateModalOpen(false);
    navigate("/documents/new", { state: { metadata } });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await dispatch(deleteDocument(deleteTarget._id));
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const getPlainTextSummary = (html = "") => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.trim();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      {/* Page Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Documents</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {documents.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Knowledge base, technical specifications, and team documentation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Document</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-8 backdrop-blur-md flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Project Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Folder className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/60 w-full md:w-48 cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            <option value="NONE">General (No Project)</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/60 w-full md:w-40 cursor-pointer"
            >
              <option value="ALL">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Documents Grid / Loading Skeleton / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse"
            >
              <div className="h-5 bg-slate-800/80 rounded w-3/4" />
              <div className="h-4 bg-slate-800/40 rounded w-full" />
              <div className="h-4 bg-slate-800/40 rounded w-2/3" />
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                <div className="w-6 h-6 rounded-full bg-slate-800" />
                <div className="w-16 h-4 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {searchTerm || selectedProjectId !== "ALL" || selectedTag !== "ALL"
              ? "No matching documents"
              : "No documents created yet"}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {searchTerm || selectedProjectId !== "ALL" || selectedTag !== "ALL"
              ? "Try adjusting your search query or reset filters."
              : "Create technical documentation, architecture specs, or team notes."}
          </p>
          {!(searchTerm || selectedProjectId !== "ALL" || selectedTag !== "ALL") && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm shadow-md cursor-pointer mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Document</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => {
            const author = doc.authorId || {};
            const project = doc.projectId;
            const isRestricted = doc.allowedMembers && doc.allowedMembers.length > 0;

            return (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Top Strip: Project badge & Lock/Public Pill */}
                  <div className="flex items-center justify-between gap-2">
                    {project ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium truncate max-w-[140px]">
                        <Folder className="w-3 h-3 shrink-0" />
                        <span className="truncate">{project.name}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">General</span>
                    )}

                    {isRestricted ? (
                      <div
                        className="flex items-center space-x-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0"
                        title="Restricted Access"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Restricted</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0"
                        title="Workspace Public"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Public</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {doc.title || "Untitled Document"}
                  </h3>

                  {/* Content Summary */}
                  {Boolean(getPlainTextSummary(doc.content)) && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {getPlainTextSummary(doc.content)}
                    </p>
                  )}

                  {/* Tags */}
                  {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {doc.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-[10px] text-slate-500">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-semibold text-indigo-300">
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
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]">
                      {author.name || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] text-slate-500">
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>

                    <button
                      onClick={() => setDeleteTarget(doc)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Document Modal */}
      <CreateDocModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
        members={members}
        onContinue={handleContinueToEditor}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete Document"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Documents;
