import React, { ReactNode } from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import ThemeSwitcher from "../ThemeSwitcher";

type NavbarUserProps = {
  children?: ReactNode;
};

const tmpUserName = "Tomek";

const NavbarWallet = ({ children }: NavbarUserProps) => {
  return (
    <li className="sm:ml-auto bg-mc-text pt-2 pb-2 rounded-[2.5rem] pr-8 pl-8">
      <div className="flex flex-row items-center justify-center gap-4">
        <NavbarUserInfo username={tmpUserName} />
        <ThemeSwitcher />
      </div>
    </li>
  );
};

export default NavbarWallet;
