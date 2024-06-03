import React, { ReactNode } from "react";
import Link from "next/link";

type FooterCenterElementProps = {
  children: ReactNode;
  link?: string;
};

const FooterCenterElement = ({
  children,
  link = undefined,
  ...props
}: FooterCenterElementProps) => {
  return (
    <Link
      className="w-screen flex flex-row items-center justify-center"
      href={link ?? ""}
      {...props}
    >
      {children}
    </Link>
  );
};

export default FooterCenterElement;
