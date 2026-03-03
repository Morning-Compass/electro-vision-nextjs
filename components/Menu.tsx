"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  Users,
  X,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import useUserContext from "@/ev-contexts/userContextProvider";

export type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  activeIcon?: string; // kept for backward compat
};

const navItems = [
  { href: "/hub", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/employees-overview", label: "Employees", icon: Users },
];

export function Menu({ isOpen, onClose }: MenuProps) {
  const pathname = usePathname();
  const { User } = useUserContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute top-14 left-0 right-0 mx-4 bg-[#1e293b] border border-[#334155] rounded-2xl p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Navigation</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 mb-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-ev-yellow/15 text-ev-yellow font-medium"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#0f172a]"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#334155] pt-3 flex items-center justify-between">
          {User.authUser?.username && (
            <span className="text-xs text-slate-500 truncate">{User.authUser.username}</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
