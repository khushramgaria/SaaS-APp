import React from "react";
import { AlertTriangle, AlertCircle, HelpCircle, X } from "lucide-react";
import Button from "../ui/Button";

const variantIcons = {
  danger: {
    icon: AlertTriangle,
    bg: "bg-red-500/10 border-red-500/20 text-red-400",
    buttonVariant: "danger",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    buttonVariant: "primary",
  },
  primary: {
    icon: HelpCircle,
    bg: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    buttonVariant: "primary",
  },
};

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const currentVariant = variantIcons[variant] || variantIcons.danger;
  const IconComponent = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${currentVariant.bg}`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={currentVariant.buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
