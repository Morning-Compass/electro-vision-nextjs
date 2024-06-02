import React, { ReactNode } from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import ThemeSwitcher from "../ThemeSwitcher";

type NavbarUserProps = {
  children?: ReactNode;
};

const tmpUserName = "Tomek";

const NavbarWallet = ({ children }: NavbarUserProps) => {
  return (
    <li className="ml-auto bg-mc-text pl-8 pr-8 pt-2 pb-2 rounded-[2.5rem]">
      <div className="flex flex-row items-center justify-center gap-4">
        <NavbarUserInfo username={tmpUserName} />
        <ThemeSwitcher />
      </div>
    </li>
  );
};

export default NavbarWallet;
