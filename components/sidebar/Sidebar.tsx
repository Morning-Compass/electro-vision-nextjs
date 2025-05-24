import { ReactNode } from "react";

export type SidebarProps = {
  children: ReactNode;
};

function Sidebar({ children, ...props }: SidebarProps) {
  return (
    <nav
      {...props}
      // className="flex flex-col self-start ml-8 bg-ev-primary p-4 rounded-[0.9em]"
      className="flex flex-col bg-ev-primary p-4 rounded-[0.9em] max-sm:hidden"
    >
      {children}
    </nav>
  );
}

export default Sidebar;
