"use client";

import useUserContext from "@/mc-contexts/userContextProvider";
import { ReactNode } from "react";

type CleanPageProps = {
  children: ReactNode;
  bgClass?: string;
  //bgProperty?: string;
};

const PageTemplate = ({
  children,
  bgClass = undefined,
  //bgProperty = undefined,
}: CleanPageProps) => {
  const { User } = useUserContext();
  return (
    <>
      {bgClass === undefined ? (
        <main
          className={`bg-center bg-fixed bg-cover text-youai-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center`}
          style={{ backgroundImage: "url('warsaw.jpg')" }}
        >
          {children}
        </main>
      ) : (
        <main
          className={`bg-center bg-fixed bg-cover text-youai-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center ${bgClass}`}
        >
          {children}
        </main>
      )}
    </>
  );
};

export default PageTemplate;
