"use client";

import React, { ReactNode } from "react";
import SidebarElement from "@/components/sidebar/SidebarElement";
import NavbarUserInfo from "@/components/navbar/NavbarUserInfo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LogoutButton from "@/components/LogoutButton";
import useUserContext from "@/ev-contexts/userContextProvider";

export type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  activeIcon?: string;
};

export function Menu({ isOpen, onClose, activeIcon = "" }: MenuProps) {
  if (!isOpen) return null;
  const { User } = useUserContext();

  const getIconClass = (iconSrc: string) => {
    const iconName = iconSrc.split("./").pop()?.replace(".svg", "");
    return activeIcon === iconName ? "icon-blue" : "";
  };

  return (
    <section className="fixed mt-[30rem] mr-40 ml-4 z-10 bg-ev-primary pl-8 w-3/4 rounded-3xl text-ev-text border-solid border-4 max-[500px]:mr-28">
      <ul className="flex flex-col items-start">
        <SidebarElement
          imageSrc="/category.svg"
          imageClassName={getIconClass("./category.svg")}
          link="/hub"
          pageName="Dashboard"
        />
        {/* <SidebarElement
          imageSrc="/timeline.svg"
          imageClassName={getIconClass("./timeline.svg")}
        /> */}
        <SidebarElement
          imageSrc="/chat.svg"
          imageClassName={getIconClass("./chat.svg")}
          link="/chat"
          pageName="Chat"
        />
        <SidebarElement
          imageSrc="/map.svg"
          imageClassName={getIconClass("./map.svg")}
          link="/workspaces"
          pageName="Workspaces"
        />
        {/* <SidebarElement
          imageSrc="/alert.svg"
          imageClassName={getIconClass("./alert.svg")}
          link="/employees-problems"
          pageName="Employees Problems"
        /> */}
        <SidebarElement
          imageSrc="/task.svg"
          imageClassName={getIconClass("./task.svg")}
          link="/employees-tasks"
          pageName="Employees Tasks"
        />
        <SidebarElement
          imageSrc="/people.svg"
          imageClassName={getIconClass("./people.svg")}
          link="/employees-overview"
          pageName="Employees Overview"
        />
        <section className="border-t-2 border-solid w-[90%] pt-2 pb-2">
          {User.authUser?.username && (
            <div className="flex flexr-row items-center gap-4">
              <NavbarUserInfo
                username={User.authUser.username}
                userPropfilePicture={
                  User.fullUser?.profile_picture ?? undefined
                }
              />
              <div>
                <LogoutButton />
              </div>
            </div>
          )}
          <div className="border-gray-700 border-solid border-2 rounded-3xl w-1/4 max-[555px]:w-1/3 max-[430px]:w-2/5 max-[375px]:w-1/2">
            <ThemeSwitcher />
          </div>
        </section>
      </ul>
    </section>
  );
}

export default Menu;
