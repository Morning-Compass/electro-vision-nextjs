"use client";

import Themes from "@/mc-const/themes";
import useUserContext from "@/mc-contexts/userContextProvider";
import React from "react";

type ButtonProps = {
  type: "submit" | "button";
  value: string;
  className?: string;
};

const Button = ({
  type,
  value,
  className = undefined,
  ...props
}: ButtonProps) => {
  const { User } = useUserContext();
  const themeColor = User.theme === Themes.dark ? "#000000" : "#FFFFFF";
  const frameColor = User.theme === Themes.dark ? "#FFFFFF" : "#000000";

  return (
    <input
      {...props}
      type={type}
      value={value}
      className={
        className ??
        "bg-mc-blue text-white rounded-2xl max-w-64 min-w-30 w-[30vw] max-h-12 min-h-8 h-[10vh] font-bold  hover:scale-110 duration-300 cursor-pointer"
      }
    />
  );
};

export default Button;
