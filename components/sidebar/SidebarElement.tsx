"use client";

import Link from "next/link";
import { ReactNode } from "react";

// New props (used by new SidebarTemplate)
type NewSidebarElementProps = {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
};

export default function SidebarElement({
  icon,
  label,
  href,
  active = false,
  collapsed = false,
}: NewSidebarElementProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 group
        ${
          active
            ? "bg-ev-yellow/10 text-ev-yellow"
            : "text-ev-muted hover:text-ev-text hover:bg-ev-surface/50"
        }
        ${collapsed ? "justify-center" : ""}
      `.trim()}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ev-yellow rounded-r-full" />
      )}

      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icon}
      </span>

      {!collapsed && (
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      )}

      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-ev-surface border border-ev-stroke text-ev-text text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-ev-card">
          {label}
        </span>
      )}
    </Link>
  );
}
