import Sidebar from "../sidebar/Sidebar";
import { ReactNode } from "react";
import SidebarElement from "@/components/sidebar/SidebarElement";

type SidebarProps = {
  activeIcon?: string;
};

export default function SidebarTemplate({ activeIcon }: SidebarProps) {
  // Fix the props destructuring
  const getIconClass = (iconSrc: string) => {
    const iconName = iconSrc.split("./").pop()?.replace(".svg", "");
    return activeIcon === iconName ? "icon-blue" : "";
  };

  return (
    <Sidebar>
      <SidebarElement
        imageSrc="/category.svg"
        imageClassName={getIconClass("./category.svg")}
        link="/hub"
      />
      <SidebarElement
        imageSrc="/timeline.svg"
        imageClassName={getIconClass("./timeline.svg")}
      />
      <SidebarElement
        imageSrc="/chat.svg"
        imageClassName={getIconClass("./chat.svg")}
        link="/chat"
      />
      <SidebarElement
        imageSrc="/map.svg"
        imageClassName={getIconClass("./map.svg")}
        link="/workspaces"
      />
      <SidebarElement
        imageSrc="/alert.svg"
        imageClassName={getIconClass("./alert.svg")}
        link="employees-problems"
      />
      <SidebarElement
        imageSrc="/task.svg"
        imageClassName={getIconClass("./task.svg")}
        link="/employees-tasks"
      />
      <SidebarElement
        imageSrc="/people.svg"
        imageClassName={getIconClass("./people.svg")}
        link="/employees-overview"
      />
    </Sidebar>
  );
}
