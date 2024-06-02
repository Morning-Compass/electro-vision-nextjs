"use client";

import Themes from "@/mc-const/themes";
import useUserContext from "@/mc-contexts/userContextProvider";

const ThemeSwitcher = () => {
  const { User } = useUserContext();
  const changeTheme = () => {
    if (User.theme === Themes.dark) User.setTheme(Themes.light);
    else if (User.theme === Themes.light) User.setTheme(Themes.dark);
  };

  const themeColor = User.theme === Themes.dark ? "#000000" : "#FFFFFF";
  const frameColor = User.theme === Themes.dark ? "#FFFFFF" : "#000000";

  return (
    <div
      style={{ background: themeColor, border: `2px solid ${frameColor}` }}
      className="rounded-[100%] w-8 h-8 cursor-pointer"
      onClick={() => {
        changeTheme();
      }}
    ></div>
  );
};

export default ThemeSwitcher;
