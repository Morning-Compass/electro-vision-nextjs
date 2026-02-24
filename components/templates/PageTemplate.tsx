"use client";

import ApiLinks from "@/ev-const/api-links";
import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import OLF from "@/ev-lib/ElectroVisionFetch";
import { User } from "@/ev-types/user-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useLayoutEffect, useState } from "react";
import toast from "react-hot-toast";

type CleanPageProps = {
  children: ReactNode;
  bgClass?: string;
  allowUnauthenticated?: boolean;
  requiredValidUser?: boolean;
};

const PageTemplate = ({
  children,
  bgClass,
  allowUnauthenticated = false,
  requiredValidUser = true,
}: CleanPageProps) => {
  const { User, UserDispatch } = useUserContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loginByToken = async () => {
    setIsLoading(true);
    try {
      const response = await OLF.post(ApiLinks.loginToken, {
        login_token:
          localStorage.getItem("jwt_token") ?? User.authUser?.token ?? "",
      });

      let user: User = {
        authUser: {
          id: response.id,
          username: response.username,
          account_verified: response.account_valid,
          email: response.email,
          token: response.token,
          created_at: response.created_at,
          roles: response.roles,
        },
        fullUser: null,
        theme: Themes.light,
        workspaceData: null,
      };
      UserDispatch({ type: "setUser", value: user });
      localStorage.setItem("jwt_token", user.authUser?.token ?? "");
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("jwt_token");
      UserDispatch({ type: "setUser", value: { authUser: null, fullUser: null, theme: Themes.light, workspaceData: null } });
      router.push("/auth/login");
      toast.error(
        error instanceof Error ? `${error.message}` : "Login failed",
        { duration: 5000 },
      );
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (allowUnauthenticated) return;
    if (!isUserValid()) {
      loginByToken();
    }
  }, []);

  const isUserValid = () => {
    return !!User.authUser?.id && !!User.authUser?.email;
  };

  const baseClasses = `bg-center bg-ev-main-bg bg-fixed bg-cover text-ev-text min-h-screen w-screen font-mono gap-5 theme-${User.theme} flex flex-col items-center h-[100vh] ${bgClass || ""}`;

  if (allowUnauthenticated) {
    return <main className={baseClasses}>{children}</main>;
  }

  const userIsValid = isUserValid();
  const showLoginPrompt = requiredValidUser && !userIsValid;

  if (showLoginPrompt) {
    return (
      <main className="bg-ev-main-bg text-ev-secondary text-2xl text-center flex items-center justify-center flex-col w-[100vw] h-[100vh]">
        <p>You need to be logged in to access this page</p>
        <Link href="/auth/login" className="text-ev-blue mt-4">
          Login here
        </Link>
      </main>
    );
  }

  return <main className={baseClasses}>{children}</main>;
};

export default PageTemplate;
