import { ReactNode } from "react";

export type NavbarMainProps = {
  children: ReactNode;
  [key: string]: unknown;
};

export function NavbarMain({ children, ...props }: NavbarMainProps) {
  return (
    <ul
      className="flex flex-col ml-12 mr-12 mb-4 items-start justify-start w-full sm:flex sm:flex-row sm:ml-4 sm:items-center sm:mb-0"
      {...props}
    >
      {children}
    </ul>
  );
}
