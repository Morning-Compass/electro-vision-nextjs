import Sidebar from "../sidebar/Sidebar";
import { ReactNode } from "react";
import SidebarElement from "@/components/sidebar/SidebarElement";

export default function SidebarTemplate() {
  return (
    <Sidebar>
      <SidebarElement imageSrc="./category.svg" />
      <SidebarElement imageSrc="./timeline.svg" />
      <SidebarElement imageSrc="./chat.svg" />
      <SidebarElement imageSrc="./map.svg" />
      <SidebarElement imageSrc="./alert.svg" />
      <SidebarElement imageSrc="./task.svg" />
      <SidebarElement imageSrc="./people.svg" />
    </Sidebar>
  );
}
