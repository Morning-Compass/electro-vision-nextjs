"use client";

import React, { ReactNode } from "react";

export type CustomMenuProps = {
  children?: ReactNode;
  sectionClassName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function CustomMenu({
  children,
  sectionClassName = "",
  isOpen,
  onClose,
  }: CustomMenuProps) {
  if (!isOpen) return null;

  return (
    <section className={`fixed mt-52 mr-0 ml-4 z-10 bg-ev-primary pl-8 pr-8 pt-4 pb-4 w-60 rounded-3xl text-ev-text border-solid border-4 ${sectionClassName}`}>
      <ul className="flex flex-col items-start">
        {children}
      </ul>
    </section>
  );
}

export default CustomMenu;
