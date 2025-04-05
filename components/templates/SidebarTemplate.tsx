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
        imageSrc="./category.svg"
        imageClassName={getIconClass("./category.svg")}
      />
      <SidebarElement
        imageSrc="./timeline.svg"
        imageClassName={getIconClass("./timeline.svg")}
      />
      <SidebarElement
        imageSrc="./chat.svg"
        imageClassName={getIconClass("./chat.svg")}
      />
      <SidebarElement
        imageSrc="./map.svg"
        imageClassName={getIconClass("./map.svg")}
      />
      <SidebarElement
        imageSrc="./alert.svg"
        imageClassName={getIconClass("./alert.svg")}
      />
      <SidebarElement
        imageSrc="./task.svg"
        imageClassName={getIconClass("./task.svg")}
      />
      <SidebarElement
        imageSrc="./people.svg"
        imageClassName={getIconClass("./people.svg")}
      />
    </Sidebar>
  );
}
