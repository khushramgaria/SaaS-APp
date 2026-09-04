import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 active:scale-[0.99]",
  secondary:
    "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 active:scale-[0.99]",
  outline:
    "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 active:scale-[0.99]",
  ghost:
    "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white active:scale-[0.99]",
  danger:
    "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 active:scale-[0.99]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2.5 font-semibold",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = "left",
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
