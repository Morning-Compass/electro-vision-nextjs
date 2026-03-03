"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ev-yellow text-[#0a0f1e] hover:brightness-110 font-semibold shadow-ev-glow-yellow",
  secondary:
    "bg-ev-surface text-ev-text hover:bg-ev-surface-2 border border-ev-stroke font-medium",
  outline:
    "bg-transparent text-ev-yellow border border-ev-yellow hover:bg-ev-yellow hover:text-[#0a0f1e] font-medium",
  ghost:
    "bg-transparent text-ev-muted hover:text-ev-text hover:bg-ev-surface font-medium",
  danger:
    "bg-ev-red text-white hover:brightness-110 font-semibold",
  success:
    "bg-ev-green text-white hover:brightness-110 font-semibold",
};

const sizes: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3.5 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 cursor-pointer select-none
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0 flex items-center">{icon}</span>
      )}
      {children}
      {!loading && iconRight && (
        <span className="flex-shrink-0 flex items-center">{iconRight}</span>
      )}
    </button>
  );
}
