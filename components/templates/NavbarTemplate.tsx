"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import useUserContext from "@/ev-contexts/userContextProvider";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/hub": "Dashboard",
  "/employees-overview": "Employees",
  "/employees-overview/add": "Add Employee",
  "/employees-overview/details": "Employee Details",
  "/workspaces": "Workspaces",
  "/workspaces/plans": "Workspace Plans",
  "/workspaces/plans/editor": "Plan Editor",
  "/employees-problems": "Problems",
  "/employees-problems/details": "Problem Details",
  "/employees-problems/problems": "Problem Workspaces",
  "/chat": "Chat",
  "/chat/employee": "Employee Chat",
  "/calendar": "Calendar",
  "/account": "My Account",
};

export default function NavbarTemplate() {
  const pathname = usePathname();
  const { User } = useUserContext();

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? "Electro Vision";

  const username = User.authUser?.username ?? "";

  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-ev-stroke bg-ev-sidebar flex-shrink-0">
      {/* page title / breadcrumb */}
      <h1 className="text-ev-text font-semibold text-base flex-1 min-w-0 truncate">
        {title}
      </h1>

      {/* search */}
      <div className="hidden md:flex items-center gap-2 bg-ev-surface border border-ev-stroke rounded-xl px-3 py-1.5 text-ev-muted text-sm min-w-40">
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs">Search...</span>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-ev-muted hover:text-ev-text hover:bg-ev-surface transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        <ThemeSwitcher />

        <Link href="/account">
          <Avatar
            src={User.fullUser?.profile_picture}
            name={username}
            size="sm"
            className="hover:ring-2 hover:ring-ev-yellow/40 transition-all"
          />
        </Link>
      </div>
    </header>
  );
}
