import React, { useState, useEffect } from "react";
import { X, Lock, Globe, Check } from "lucide-react";
import Button from "../ui/Button";

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

const DocAccessModal = ({
  isOpen,
  onClose,
  allowedMembers = [],
  onSave,
  members = [],
  isLoading = false,
}) => {
  const [accessType, setAccessType] = useState("workspace"); // "workspace" | "restricted"
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (allowedMembers && allowedMembers.length > 0) {
        setAccessType("restricted");
        const ids = allowedMembers.map((m) => (typeof m === "object" ? m._id : m));
        setSelectedUserIds(ids);
      } else {
        setAccessType("workspace");
        setSelectedUserIds([]);
      }
    }
  }, [isOpen, allowedMembers]);

  if (!isOpen) return null;

  const toggleUser = (userId) => {
    if (!userId) return;
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSave = () => {
    const finalAllowed = accessType === "workspace" ? [] : selectedUserIds;
    onSave(finalAllowed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-100">Document Access & Permissions</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Access Type Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAccessType("workspace")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                accessType === "workspace"
                  ? "border-indigo-500 bg-indigo-950/30 text-indigo-200 shadow-md shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                {accessType === "workspace" && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-100">Workspace</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Anyone in workspace can view & edit
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccessType("restricted")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                accessType === "restricted"
                  ? "border-indigo-500 bg-indigo-950/30 text-indigo-200 shadow-md shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                {accessType === "restricted" && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-100">Restricted</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Only specific members added below
                </p>
              </div>
            </button>
          </div>

          {/* Member List (If Restricted) */}
          {accessType === "restricted" && (
            <div className="space-y-3 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Authorized Members
                </span>
                <span className="text-xs text-slate-500">
                  {selectedUserIds.length} selected
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
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
                          ? "bg-slate-800 border-indigo-500/40 text-slate-100"
                          : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 overflow-hidden shrink-0">
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
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {name}
                          </p>
                          {email && (
                            <p className="text-xs text-slate-500 truncate">{email}</p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "border-slate-700 bg-slate-950/40"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}

                {members.length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No other workspace members found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-end space-x-3 bg-slate-950/40">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
            Save Permissions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocAccessModal;
