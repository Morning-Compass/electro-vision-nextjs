"use client";

import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
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
  disabled?: boolean;
  additionalClassName?: string;
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
  disabled = false,
  additionalClassName = undefined,
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
      disabled={disabled}
      {...(type === "image" && src ? { src } : {})}
      className={
        className ??
        ` ${bgColor ?? "bg-ev-blue"} ${textColor ?? "text-white"} ${rounded === true ? "rounded-[0.9rem]" : ""} max-w-64 min-w-30 ${customWidth ?? "w-[30vw]"} max-h-12 min-h-8 ${customHeight ?? "h-[10vh]"} font-bold  ${hoverEffect === true ? "hover:scale-110" : ""} duration-300 cursor-pointer ${additionalClassName ?? ""}`
      }
    />
  );
};

export default Button;
