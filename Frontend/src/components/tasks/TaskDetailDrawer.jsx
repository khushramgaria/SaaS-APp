import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  X,
  Trash2,
  Save,
  Calendar,
  User,
  Shield,
  Tag,
  AlignLeft,
  Clock,
} from "lucide-react";
import Button from "../ui/Button";
import ConfirmModal from "../common/ConfirmModal";
import { updateTask, deleteTask } from "../../redux/slices/taskSlice";

const TaskDetailDrawer = ({ task, isOpen, onClose, members = [] }) => {
  const dispatch = useDispatch();
  const { activeWorkspace } = useSelector((state) => state.auth);
  const userRole = activeWorkspace?.role || "MEMBER";
  const isViewer = userRole === "VIEWER";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "TODO");
      setPriority(task.priority || "MEDIUM");
      setAssigneeId(task.assigneeId?._id || task.assigneeId || "");
      setDueDate(
        task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : ""
      );
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await dispatch(
        updateTask({
          taskId: task._id,
          title,
          description,
          status,
          priority,
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
        })
      ).unwrap();
      toast.success("Task updated successfully.");
      setIsSaving(false);
      onClose();
    } catch (error) {
      setIsSaving(false);
      toast.error(typeof error === "string" ? error : "Failed to update task.");
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteTask(task._id)).unwrap();
      toast.success("Task deleted successfully.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error) {
      setIsDeleting(false);
      toast.error(typeof error === "string" ? error : "Failed to delete task.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded">
                {task.taskKey || "TASK"}
              </span>
              <span className="text-xs text-slate-400 truncate max-w-[200px]">
                {task.projectId?.name || "Project Task"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isViewer && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                disabled={isViewer}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 text-white font-semibold text-lg border border-slate-800 focus:border-violet-500 rounded-xl p-3 outline-none transition-all disabled:opacity-70"
              />
            </div>

            {/* Grid for Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  disabled={isViewer}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs font-semibold outline-none cursor-pointer disabled:opacity-70"
                >
                  <option value="BACKLOG">BACKLOG</option>
                  <option value="TODO">TO DO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  disabled={isViewer}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs font-semibold outline-none cursor-pointer disabled:opacity-70"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-violet-400" />
                  <span>Assignee</span>
                </label>
                <select
                  value={assigneeId}
                  disabled={isViewer}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs outline-none cursor-pointer disabled:opacity-70"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => {
                    const id = m.userId || m._id || m.membershipId;
                    const name = m.name || m.userId?.name;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-violet-400" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  disabled={isViewer}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs outline-none cursor-pointer disabled:opacity-70"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <AlignLeft className="w-3 h-3 text-violet-400" />
                <span>Description</span>
              </label>
              <textarea
                rows={6}
                value={description}
                disabled={isViewer}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add task description, context, or acceptance criteria..."
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-sm outline-none transition-all resize-none leading-relaxed disabled:opacity-70"
              />
            </div>
          </form>

          {/* Drawer Footer Actions */}
          {!isViewer && (
            <div className="p-6 border-t border-slate-800/80 flex items-center justify-end gap-3 bg-slate-900/90">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Are you sure you want to delete task "${task.taskKey}"? This action cannot be undone.`}
        confirmText="Delete Task"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TaskDetailDrawer;
