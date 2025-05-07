"use client";

import useUserContext from "@/ev-contexts/userContextProvider";
import Link from "next/link";
import { ReactNode } from "react";

type CleanPageProps = {
  children: ReactNode;
  bgClass?: string;
  allowUnauthenticated?: boolean;
};

const PageTemplate = ({
  children,
  bgClass,
  allowUnauthenticated = false,
}: CleanPageProps) => {
  const { User } = useUserContext();

  const isUserValid = () => {
    return !!User.authUser?.id && !!User.authUser?.email;
  };

  const baseClasses = `bg-center bg-ev-main-bg bg-fixed bg-cover text-ev-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center ${bgClass || ""}`;

  if (allowUnauthenticated || isUserValid()) {
    return <main className={baseClasses}>{children}</main>;
  }

  return (
    <main
      className={
        "bg-ev-main-bg text-ev-secondary text-2xl text-center flex items-center justify-center flex-col w-[100vw] h-[100vh]"
      }
    >
      <p>You need to be logged in to access this page</p>
      <Link href={"/auth/login"} className="text-ev-blue mt-4">
        Login here
      </Link>
    </main>
  );
};

export default PageTemplate;
