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

  return (
    <div
      className={`rounded-[4rem] w-20 h-10 cursor-pointer duration-150 ${User.theme === Themes.dark ? "bg-mc-darkgrey" : "bg-mc-white"} flex items-center`}
      onClick={() => {
        changeTheme();
      }}
    >
      <div className={`${User.theme !== Themes.dark ? "ml-auto" : "mr-auto"} `}>
        <Image
          src={User.theme !== Themes.dark ? "/sun.png" : "/moon.png"}
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
