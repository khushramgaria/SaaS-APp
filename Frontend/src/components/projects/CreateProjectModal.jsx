import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { X, FolderPlus, Key, Users, AlignLeft } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createProject } from "../../redux/slices/projectSlice";

const CreateProjectModal = ({ isOpen, onClose, members = [] }) => {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((state) => state.projects);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  if (!isOpen) return null;

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        key: data.key.toUpperCase().trim(),
        description: data.description,
        members: selectedMembers,
      };

      const result = await dispatch(createProject(payload)).unwrap();
      toast.success(`Project "${result.data?.name || "created"}" initialized!`);
      reset();
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to create project.");
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create New Project
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set up a project workspace for team tasks & repositories
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Project Name"
                placeholder="e.g., Mobile App Launch"
                error={errors.name?.message}
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
            </div>
            <div>
              <Input
                label="Key (Prefix)"
                placeholder="MOB"
                icon={Key}
                error={errors.key?.message}
                {...register("key", {
                  required: "Key required",
                  minLength: { value: 2, message: "Min 2 chars" },
                  maxLength: { value: 5, message: "Max 5 chars" },
                  onChange: (e) => {
                    setValue("key", e.target.value.toUpperCase());
                  },
                })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span>Description</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the goals and scope of this project..."
              {...register("description")}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl p-3 text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Members Selection List */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span>Initial Team Members ({selectedMembers.length})</span>
            </label>
            <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-2 space-y-1">
              {members.map((m) => {
                const id = m.userId || m._id || m.membershipId;
                const name = m.name || m.userId?.name;
                const isSelected = selectedMembers.includes(id);

                return (
                  <div
                    key={id}
                    onClick={() => handleMemberToggle(id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs font-medium ${
                      isSelected
                        ? "bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/30"
                        : "hover:bg-slate-200/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{name}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-violet-600 rounded cursor-pointer"
                    />
                  </div>
                );
              })}
              {members.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 p-2">No members found.</p>
              )}
            </div>
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
              icon={FolderPlus}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
