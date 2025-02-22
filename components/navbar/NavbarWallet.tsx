"use client";

import React, { ReactNode } from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import ThemeSwitcher from "../ThemeSwitcher";
import useUserContext from "@/ev-contexts/userContextProvider";

type NavbarUserProps = {
  children?: ReactNode;
};

const NavbarWallet = ({ children }: NavbarUserProps) => {
  const { User } = useUserContext();

  return (
    <>
      {User.username && User.userId ? (
        <li className="sm:ml-auto bg-gradient-to-r from-cyan-500 to-mc-yellow text-gray-100 pt-2 pb-2 rounded-[2.5rem] pr-8 pl-8">
          <div className="text-mc-white flex flex-row items-center justify-center gap-4">
            <NavbarUserInfo
              username={User.username}
              userPropfilePicture={User.profilePicture ?? undefined}
            />
            <ThemeSwitcher />
          </div>
        </li>
      ) : null}
    </>
  );
};

export default NavbarWallet;
