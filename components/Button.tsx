"use client";

import Themes from "@/mc-const/themes";
import useUserContext from "@/mc-contexts/userContextProvider";
import React from "react";

type ButtonProps = {
  type: "submit" | "button" | "image";
  value?: string;
  className?: string;
  customWidth?: string;
  customHeight?: string;
  bgColor?: string;
  textColor?: string;
  rounded?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void | unknown;
  src?: string;
};

const Button = ({
  type,
  value = undefined,
  className = undefined,
  customWidth = undefined,
  customHeight = undefined,
  bgColor = undefined,
  textColor = undefined,
  rounded = true,
  hoverEffect = false,
  onClick = undefined,
  src = undefined,
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
      onClick={onClick}
      src={type === "image" ? src : ""}
      className={
        className ??
        ` ${bgColor ?? "bg-mc-blue"} ${textColor ?? "text-white"} ${rounded === true ? "rounded-2xl" : ""} max-w-64 min-w-30 ${customWidth ?? "w-[30vw]"} max-h-12 min-h-8 ${customHeight ?? "h-[10vh]"} font-bold  ${hoverEffect === true ? "hover:scale-110" : ""} duration-300 cursor-pointer`
      }
    />
  );
};

export default Button;
