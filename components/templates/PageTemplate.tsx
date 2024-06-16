"use client";

import useUserContext from "@/mc-contexts/userContextProvider";
import { ReactNode } from "react";

type CleanPageProps = {
  children: ReactNode;
  additionalClassNameProperties?: string;
};

const PageTemplate = ({
  children,
  additionalClassNameProperties = undefined,
}: CleanPageProps) => {
  const { User } = useUserContext();
  return (
    <main
      className={`bg-center bg-fixed bg-cover text-youai-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center ${additionalClassNameProperties ?? ""}`}
      style={{ backgroundImage: "url('warsaw.jpg')" }}
    >
      {children}
    </main>
  );
};

export default PageTemplate;
