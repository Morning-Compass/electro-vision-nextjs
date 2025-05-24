"use client";

import React, {ReactNode, useState} from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import ThemeSwitcher from "../ThemeSwitcher";
import useUserContext from "@/ev-contexts/userContextProvider";
import SearchButton from "../SearchButton";
import CalendarButton from "../CalendarButton";
import LogoutButton from "../LogoutButton";
import Menu from "@/components/Menu";

type NavbarUserProps = {
  children?: ReactNode;
};

const NavbarWallet = ({ children }: NavbarUserProps) => {
  const { User } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {User.authUser?.username && User.authUser.id ? (
        <li className="sm:ml-auto pt-2 pb-2 rounded-[2.5rem] pr-8 pl-8 max-sm:pr-2 max-[1152px]:pr-0 max-[1152px]:pl-0 max-[720px]:text-sm">
          <div className="text-ev-white flex flex-row items-center justify-center gap-4">
            <SearchButton />
            <div className="flex flex-row gap-4 items-center max-sm:hidden">
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
            <button
              className="hidden max-sm:block flex-col items-center justify-center w-8 h-10 space-y-1.5 group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="block w-6 h-1 rounded-full bg-gray-600 group-focus:bg-[#0090cf]"></span>
              <span className="block w-6 h-1 rounded-full bg-gray-600 group-focus:bg-[#0090cf]"></span>
              <span className="block w-6 h-1 rounded-full bg-gray-600 group-focus:bg-[#0090cf]"></span>
            </button>
            <Menu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>
        </li>
      ) : null}
    </>
  );
};

export default NavbarWallet;
