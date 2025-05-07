import { ReactNode } from "react";

export type SidebarProps = {
  children: ReactNode;
};

function Sidebar({ children, ...props }: SidebarProps) {
  return (
    <nav
      {...props}
      className="flex flex-col self-start ml-8 bg-ev-primary p-4 rounded-[0.9em]"
    >
      {children}
    </nav>
  );
}

export default Sidebar;
