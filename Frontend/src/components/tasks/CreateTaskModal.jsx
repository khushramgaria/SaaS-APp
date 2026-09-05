import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { X, Plus, Calendar, User, Folder, Flag } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createTask } from "../../redux/slices/taskSlice";

const CreateTaskModal = ({
  isOpen,
  onClose,
  projects = [],
  members = [],
  defaultProjectId = "",
}) => {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((state) => state.tasks);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      projectId: defaultProjectId || "",
      priority: "MEDIUM",
      status: "TODO",
      assigneeId: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (defaultProjectId) {
      setValue("projectId", defaultProjectId);
    }
  }, [defaultProjectId, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(createTask(data)).unwrap();
      toast.success(
        `Task "${result.data?.taskKey || "created"}" added successfully!`
      );
      reset();
      onClose();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to create task.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-left text-slate-900 dark:text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create New Task
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add a new task item to your workspace or project
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Implement authentication middleware"
            error={errors.title?.message}
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
            })}
          />

          {/* Project Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span>Project</span>
            </label>
            <select
              disabled={Boolean(defaultProjectId)}
              {...register("projectId", { required: "Project is required" })}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-sm outline-none transition-all cursor-pointer disabled:opacity-60"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
            {errors.projectId && (
              <span className="text-xs text-red-500 dark:text-red-400">
                {errors.projectId.message}
              </span>
            )}
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="BACKLOG">BACKLOG</option>
                <option value="TODO">TO DO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Flag className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                <span>Priority</span>
              </label>
              <select
                {...register("priority")}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                <span>Assignee</span>
              </label>
              <select
                {...register("assigneeId")}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Optional task details or acceptance criteria..."
              {...register("description")}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl p-3 text-sm outline-none transition-all resize-none"
            />
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
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={Plus}
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
