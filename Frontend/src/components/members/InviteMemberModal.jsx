import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { X, Mail, Shield, Send } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createInvite } from "../../redux/slices/memberSlice";

const InviteMemberModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isSubmittingInvite } = useSelector((state) => state.members);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(createInvite(data)).unwrap();
      toast.success(result.message || `Invitation sent to ${data.email}`);
      reset();
      onClose();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to send invite.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 dark:bg-violet-600/20 border border-violet-500/20 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Invite Teammate
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Send an email invite to join your active workspace
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            icon={Mail}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Assigned Role</span>
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl py-3 px-4 text-sm outline-none transition-all cursor-pointer shadow-sm"
            >
              <option value="ADMIN">Admin (Full workspace management)</option>
              <option value="MEMBER">Member (Create & collaborate)</option>
              <option value="VIEWER">Viewer (Read-only access)</option>
            </select>
            {errors.role && (
              <span className="text-xs text-red-500 dark:text-red-400">{errors.role.message}</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmittingInvite}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingInvite}
              icon={Send}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
