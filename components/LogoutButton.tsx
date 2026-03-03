"use client";

import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { User } from "@/ev-types/user-types";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  collapsed?: boolean;
};

const LogoutButton = ({ collapsed = false }: LogoutButtonProps) => {
  const { UserDispatch } = useUserContext();
  const router = useRouter();

  const handleLogout = () => {
    UserDispatch({
      type: "setUser",
      value: {
        authUser: null,
        fullUser: null,
        theme: Themes.dark,
        workspaceData: null,
      } as User,
    });
    localStorage.removeItem("jwt_token");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      title={collapsed ? "Logout" : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-ev-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <LogOut className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span className="text-sm">Logout</span>}
    </button>
  );
};

export default LogoutButton;
