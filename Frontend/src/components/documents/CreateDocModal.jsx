import React, { useState, useEffect } from "react";
import { X, FileText, Globe, Lock, Check, Tag, Folder, ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const getMemberDetails = (m) => {
  const userId =
    typeof m.userId === "object"
      ? m.userId?._id
      : m.userId || m._id || m.id;
  const name = m.name || (typeof m.userId === "object" ? m.userId?.name : "") || "Workspace Member";
  const email = m.email || (typeof m.userId === "object" ? m.userId?.email : "") || "";
  const avatar = m.avatarUrl || m.avatar || (typeof m.userId === "object" ? m.userId?.avatarUrl : "");
  return { userId, name, email, avatar };
};

const CreateDocModal = ({
  isOpen,
  onClose,
  projects = [],
  members = [],
  defaultProjectId = "",
  onContinue,
}) => {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [accessType, setAccessType] = useState("workspace"); // "workspace" | "restricted"
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  if (!isOpen) return null;

  const toggleUser = (userId) => {
    if (!userId) return;
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const allowedMembers = accessType === "workspace" ? [] : selectedUserIds;
    onContinue({
      title: title.trim(),
      projectId: projectId || null,
      allowedMembers,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create New Document</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set document metadata before composing.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Document Title */}
          <Input
            label="Document Title"
            placeholder="e.g. Product Requirements Specification"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          {/* Linked Project */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Linked Project (Optional)
            </label>
            <div className="relative">
              <Folder className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="">No Project (General Document)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Access / Permissions Toggle Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Access & Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccessType("workspace")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  accessType === "workspace"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-md shadow-indigo-500/10"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {accessType === "workspace" && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">Everyone in workspace</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Open workspace access</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccessType("restricted")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  accessType === "restricted"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-md shadow-indigo-500/10"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {accessType === "restricted" && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">Specific members only</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Restricted permissions</p>
                </div>
              </button>
            </div>
          </div>

          {/* Member Selection Checklist (If Restricted) */}
          {accessType === "restricted" && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Select Authorized Members
                </span>
                <span className="text-xs text-slate-500">
                  {selectedUserIds.length} selected
                </span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {members.map((member, index) => {
                  const { userId, name, email, avatar } = getMemberDetails(member);
                  if (!userId) return null;
                  const isChecked = selectedUserIds.includes(userId);

                  return (
                    <div
                      key={userId || index}
                      onClick={() => toggleUser(userId)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-slate-100 dark:bg-slate-800 border-indigo-500/40 text-slate-900 dark:text-slate-100"
                          : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-300 overflow-hidden shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{name}</p>
                          {email && <p className="text-[11px] text-slate-500 truncate">{email}</p>}
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/40"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md cursor-pointer"
            >
              <span>Continue to Editor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDocModal;
