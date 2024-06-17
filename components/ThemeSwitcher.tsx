"use client";

import Themes from "@/mc-const/themes";
import useUserContext from "@/mc-contexts/userContextProvider";
import Image from "next/image";

const ThemeSwitcher = () => {
  const { User, UserDispatch } = useUserContext();
  const changeTheme = () => {
    if (User.theme === Themes.dark)
      UserDispatch({ type: "setTheme", value: "light" });
    else if (User.theme === Themes.light)
      UserDispatch({ type: "setTheme", value: "dark" });
  };

  //const themeColor = User.theme === Themes.dark ? "#000000" : "#FFFFFF";
  //const frameColor = User.theme === Themes.dark ? "#FFFFFF" : "#000000";

  const themeImg =
    User.theme === Themes.dark ? "../public/sun.png" : "../public/moon.png";

  return (
    <div
      className="rounded-[100%] w-8 h-8 cursor-pointer aspect-square"
      onClick={() => {
        changeTheme();
      }}
    >
      <Image
        src={User.theme !== Themes.dark ? "/sun.png" : "/moon.png"}
        alt="theme"
        width={32}
        height={32}
      />
    </div>
  );
};

export default ThemeSwitcher;
