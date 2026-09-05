import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { X, UserPlus, Users } from "lucide-react";
import Button from "../ui/Button";
import { updateProjectMembers } from "../../redux/slices/projectSlice";

const AddProjectMemberModal = ({
  isOpen,
  onClose,
  project,
  workspaceMembers = [],
}) => {
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project && project.members) {
      const initialIds = project.members.map((m) => m._id || m);
      setSelectedIds(initialIds);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await dispatch(
        updateProjectMembers({
          projectId: project._id,
          members: selectedIds,
        })
      ).unwrap();
      toast.success("Project team members updated successfully.");
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      toast.error(typeof error === "string" ? error : "Failed to update project team.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-left text-slate-900 dark:text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Manage Project Team
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign or remove workspace members for {project.name}
            </p>
          </div>
        </div>

        {/* Member Checklist */}
        <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 space-y-1.5 mb-6">
          {workspaceMembers.map((m) => {
            const id = m.userId || m._id || m.membershipId;
            const name = m.name || m.userId?.name;
            const email = m.email || m.userId?.email;
            const isSelected = selectedIds.includes(id);

            return (
              <div
                key={id}
                onClick={() => handleToggle(id)}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-violet-600/20 text-violet-700 dark:text-violet-200 border border-violet-500/30"
                    : "hover:bg-slate-200/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{email}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="accent-violet-600 rounded cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Save Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectMemberModal;
