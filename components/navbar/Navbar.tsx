import { ReactNode } from "react";

export type NavbarProps = {
  children: ReactNode;
};

function Navbar({ children, ...props }: NavbarProps) {
  return (
    <nav
      {...props}
      className="flex flex-row justify-center bg-mc-primary text-mc-text  min-h-16 font-bold transition-colors duration-500 w-[90vw] mt-10 rounded-3xl"
    >
      {children}
    </nav>
  );
}

export default Navbar;
