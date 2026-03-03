import { ReactNode } from "react";

export type SidebarProps = {
  children: ReactNode;
  collapsed?: boolean;
};

export default function Sidebar({ children, collapsed = false }: SidebarProps) {
  return (
    <nav
      className={`
        flex flex-col h-full bg-ev-sidebar border-r border-ev-stroke
        transition-all duration-300 flex-shrink-0
        ${collapsed ? "w-16" : "w-56"}
      `.trim()}
    >
      {children}
    </nav>
  );
}
