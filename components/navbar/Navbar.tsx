import { ReactNode } from "react";

export type NavbarProps = {
  children: ReactNode;
};

function Navbar({ children, ...props }: NavbarProps) {
  return (
    <nav
      {...props}
      className="flex flex-row justify-center bg-mc-primary text-mc-text  min-h-16 w-screen font-bold transition-colors duration-500"
    >
      {children}
    </nav>
  );
}

export default Navbar;
