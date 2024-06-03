"use client";

import React, { ReactNode } from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import ThemeSwitcher from "../ThemeSwitcher";
import useUserContext from "@/mc-contexts/userContextProvider";

type NavbarUserProps = {
  children?: ReactNode;
};

const NavbarWallet = ({ children }: NavbarUserProps) => {
  const { User } = useUserContext();

  return (
    <>
      {User.username && User.userId ? (
        <li className="sm:ml-auto bg-mc-text pt-2 pb-2 rounded-[2.5rem] pr-8 pl-8">
          <div className="flex flex-row items-center justify-center gap-4">
            <NavbarUserInfo username={User.username} />
            <ThemeSwitcher />
          </div>
        </li>
      ) : null}
    </>
  );
};

export default NavbarWallet;
