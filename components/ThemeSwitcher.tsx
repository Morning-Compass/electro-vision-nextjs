"use client";

import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import Image from "next/image";

const ThemeSwitcher = () => {
  const { User, UserDispatch } = useUserContext();

  const changeTheme = () => {
    if (User.theme === Themes.dark)
      UserDispatch({ type: "setTheme", value: "light" });
    else if (User.theme === Themes.light)
      UserDispatch({ type: "setTheme", value: "dark" });
  };

  return (
    <div
      className={`rounded-[4rem] w-20 h-10 cursor-pointer transition-colors duration-500 bg-mc-primary flex items-center relative`}
      onClick={changeTheme}
    >
      <div
        className={`absolute transform transition-transform duration-500 ${User.theme === Themes.dark ? "translate-x-1" : "translate-x-[2.5rem]"}`}
      >
        <Image
          src={User.theme === Themes.dark ? "/moon.png" : "/sun.png"}
          alt="theme"
          width={32}
          height={32}
          className="mr-1 ml-1"
        />
      </div>
    </div>
  );
};

export default ThemeSwitcher;
