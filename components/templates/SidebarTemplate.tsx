"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Building2,
  AlertTriangle,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";
import SidebarElement from "@/components/sidebar/SidebarElement";
import Avatar from "@/components/ui/Avatar";
import useUserContext from "@/ev-contexts/userContextProvider";
import LogoutButton from "@/components/LogoutButton";

type SidebarProps = {
  activeIcon?: string; // kept for backward compat, now auto-detected
};

const navItems = [
  { href: "/hub", label: "Dashboard", icon: LayoutDashboard, match: "/hub" },
  { href: "/employees-overview", label: "Employees", icon: Users, match: "/employees" },
  { href: "/workspaces", label: "Workspaces", icon: Building2, match: "/workspaces" },
  { href: "/employees-problems", label: "Problems", icon: AlertTriangle, match: "/employees-problems" },
  { href: "/chat", label: "Chat", icon: MessageSquare, match: "/chat" },
  { href: "/calendar", label: "Calendar", icon: Calendar, match: "/calendar" },
];

export default function SidebarTemplate({ activeIcon }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { User } = useUserContext();

  const username = User.authUser?.username ?? User.fullUser?.phone ?? "User";

  return (
    <Sidebar collapsed={collapsed}>
      {/* logo */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-ev-stroke flex-shrink-0 ${
          collapsed ? "justify-center px-2" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-ev-yellow/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-ev-yellow" />
        </div>
        {!collapsed && (
          <span className="text-ev-text font-bold text-sm whitespace-nowrap">
            Electro Vision
          </span>
        )}
      </div>

      {/* nav items */}
      <div className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, match }) => (
          <SidebarElement
            key={href}
            href={href}
            label={label}
            icon={<Icon className="w-5 h-5" />}
            active={pathname.startsWith(match)}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* bottom: user + settings */}
      <div className="flex flex-col gap-1 p-3 border-t border-ev-stroke flex-shrink-0">
        <Link
          href="/account"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-ev-muted hover:text-ev-text hover:bg-ev-surface/50 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Account" : undefined}
        >
          <Avatar
            src={User.fullUser?.profile_picture}
            name={username}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-ev-text truncate">
                {username}
              </div>
              <div className="text-[10px] text-ev-muted truncate">
                {User.authUser?.email ?? ""}
              </div>
            </div>
          )}
          {!collapsed && <Settings className="w-4 h-4 flex-shrink-0" />}
        </Link>

        <LogoutButton collapsed={collapsed} />

        {/* collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-ev-muted hover:text-ev-text hover:bg-ev-surface/50 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </Sidebar>
  );
}
