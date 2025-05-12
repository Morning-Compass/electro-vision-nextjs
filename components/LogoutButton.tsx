"use client";

import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { User } from "@/ev-types/user-types";
import { useRouter } from "next/navigation";
import React from "react";

const logout = (router, userDispatch) => {
  userDispatch({
    type: "setUser",
    value: {
      authUser: null,
      fullUser: null,
      theme: Themes.light,
      currentWorkspace: null,
    } as User,
  });
  router.push("/");
  router.refresh();
};

const LogoutButton = () => {
  const { UserDispatch } = useUserContext();
  const router = useRouter();

  return (
    <button
      onClick={() => logout(router, UserDispatch)}
      className="text-ev-text"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
