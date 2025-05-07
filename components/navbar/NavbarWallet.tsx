"use client";

import React, { ReactNode } from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import ThemeSwitcher from "../ThemeSwitcher";
import useUserContext from "@/ev-contexts/userContextProvider";
import SearchButton from "../SearchButton";
import CalendarButton from "../CalendarButton";
import LogoutButton from "../LogoutButton";

type NavbarUserProps = {
  children?: ReactNode;
};

const NavbarWallet = ({ children }: NavbarUserProps) => {
  const { User } = useUserContext();

  return (
    <>
      {User.authUser?.username && User.authUser.id ? (
        <li className="sm:ml-auto  pt-2 pb-2 rounded-[2.5rem] pr-8 pl-8">
          <div className="text-ev-white flex flex-row items-center justify-center gap-4">
            <SearchButton />
            <NavbarUserInfo
              username={User.authUser.username}
              userPropfilePicture={User.fullUser?.profile_picture ?? undefined}
            />
            <div
              //className="bg-gradient-to-r from-cyan-500 to-ev-yellow "
              className="border-gray-700 border-solid border-2 rounded-3xl pr-2 pl-2"
            >
              <ThemeSwitcher />
            </div>
            <div>
              <LogoutButton />
            </div>
          </div>
        </li>
      ) : null}
    </>
  );
};

export default NavbarWallet;
