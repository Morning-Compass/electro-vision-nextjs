import { ReactNode } from "react";

export type NavbarProps = {
  children: ReactNode;
};

function Navbar({ children, ...props }: NavbarProps) {
  return (
    <nav
      {...props}
      className="flex flex-row justify-center bg-ev-primary text-ev-text  min-h-16 font-bold transition-colors duration-500 w-[90vw] mt-10 rounded-3xl max-sm:flex-col max-sm:align-middle"
    >
      {children}
    </nav>
  );
}

export default Navbar;
