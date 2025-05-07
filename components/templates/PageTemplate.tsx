"use client";

import useUserContext from "@/ev-contexts/userContextProvider";
import { ReactNode } from "react";

type CleanPageProps = {
  children: ReactNode;
  bgClass?: string;
  userVerification?: boolean;
  //bgProperty?: string;
};

const PageTemplate = ({
  children,
  bgClass = undefined,
  userVerification = undefined,
  //bgProperty = undefined,
}: CleanPageProps) => {
  const { User } = useUserContext();
  return (
    <>
      {userVerification === undefined || userVerification === false ? (
        bgClass === undefined ? (
          <main
            className={`bg-center bg-fixed bg-cover text-mc-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center`}
          >
            {children}
          </main>
        ) : (
          <main
            className={`bg-center bg-fixed bg-cover text-mc-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center ${bgClass}`}
          >
            {children}
          </main>
        )
      ) : (
        <main
          className={`bg-center bg-fixed bg-cover text-mc-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center ${bgClass}`}
        >
          <h1>You need to be logged in to acces this functionality</h1>
        </main>
      )}
    </>
  );
};

export default PageTemplate;
