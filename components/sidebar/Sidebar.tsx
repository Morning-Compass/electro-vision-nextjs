import { ReactNode } from "react";

export type SidebarProps = {
  children: ReactNode;
};

function Sidebar({ children, ...props }: SidebarProps) {
  return <nav {...props}>{children}</nav>;
}

export default Sidebar;
