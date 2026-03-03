"use client";

import ApiLinks from "@/ev-const/api-links";
import { MobileSidebarProvider } from "@/ev-contexts/mobileSidebarContext";
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loginByToken = async () => {
    setIsLoading(true);
    try {
      const response = await OLF.post(ApiLinks.loginToken, {
        login_token:
          localStorage.getItem("jwt_token") ?? User.authUser?.token ?? "",
      });

      const user: User = {
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
        theme: Themes.dark,
        workspaceData: null,
      };
      UserDispatch({ type: "setUser", value: user });
      localStorage.setItem("jwt_token", user.authUser?.token ?? "");
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("jwt_token");
      UserDispatch({
        type: "setUser",
        value: {
          authUser: null,
          fullUser: null,
          theme: Themes.dark,
          workspaceData: null,
        },
      });
      router.push("/auth/login");
      toast.error(
        error instanceof Error ? error.message : "Session expired",
        { duration: 5000 }
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

  const isUserValid = () => !!User.authUser?.id && !!User.authUser?.email;

  const baseClasses = `theme-${User.theme ?? "dark"} bg-ev-main-bg text-ev-text min-h-screen w-screen flex flex-col ${bgClass ?? ""}`;

  // Auth pages — full screen centered
  if (allowUnauthenticated) {
    return (
      <MobileSidebarProvider>
        <main className={baseClasses}>{children}</main>
      </MobileSidebarProvider>
    );
  }

  // Require login
  if (requiredValidUser && !isUserValid() && !isLoading) {
    return (
      <MobileSidebarProvider>
        <main className="bg-[#0a0f1e] theme-dark text-slate-100 text-center flex items-center justify-center flex-col w-screen h-screen gap-4">
          <div className="text-4xl">⚡</div>
          <p className="text-lg font-semibold">Authentication required</p>
          <p className="text-slate-400 text-sm">Please sign in to access this page</p>
          <Link
            href="/auth/login"
            className="mt-2 px-5 py-2.5 bg-ev-yellow text-[#0a0f1e] rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            Sign In
          </Link>
        </main>
      </MobileSidebarProvider>
    );
  }

  return (
    <MobileSidebarProvider>
      <main className={baseClasses}>{children}</main>
    </MobileSidebarProvider>
  );
};

export default PageTemplate;
