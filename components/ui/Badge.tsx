import { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "yellow"
  | "purple";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-ev-surface text-ev-muted border-ev-stroke",
  success: "bg-green-500/15 text-green-400 border-green-500/25",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  danger: "bg-red-500/15 text-red-400 border-red-500/25",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  yellow: "bg-ev-yellow/15 text-ev-yellow border-ev-yellow/25",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-ev-muted",
  success: "bg-green-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
  yellow: "bg-ev-yellow",
  purple: "bg-purple-400",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-xs font-semibold rounded-full border
        ${variants[variant]}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

// Helper: map task status to badge variant
export function taskStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    COMPLETED: "success",
    IN_PROGRESS: "info",
    TODO: "default",
    HELP_NEEDED: "danger",
    CANCELED: "warning",
  };
  return map[status] ?? "default";
}

// Helper: map employee status to badge variant
export function employeeStatusBadge(status: string): BadgeVariant {
  if (status === "Work from office") return "success";
  if (status === "Work from home") return "info";
  if (status === "Absent") return "danger";
  if (status === "Late arrival") return "warning";
  return "default";
}
