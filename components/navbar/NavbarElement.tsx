import { ReactNode } from "react";
import Link from "next/link";

export type NavbarElementProps = {
  children: ReactNode;
  link?: string | undefined;
  [key: string]: unknown;
};

export function NavbarElement({
  children,
  link = undefined,
  ...props
}: NavbarElementProps) {
  return (
    <li className="sm:mr-10 flex-grow-1 flex justify-center" {...props}>
      <Link
        className="hover:text-youai-light-red hover:scale-100 duration-200 pt-4 pb-4 text-xl"
        href={link ?? ""}
      >
        {children}
      </Link>
    </li>
  );
}
