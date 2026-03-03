"use client";

import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const { User, UserDispatch } = useUserContext();
  const isDark = User.theme === Themes.dark;

  const changeTheme = () => {
    UserDispatch({ type: "setTheme", value: isDark ? "light" : "dark" });
  };

  return (
    <button
      onClick={changeTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 rounded-xl flex items-center justify-center text-ev-muted hover:text-ev-text hover:bg-ev-surface transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeSwitcher;
