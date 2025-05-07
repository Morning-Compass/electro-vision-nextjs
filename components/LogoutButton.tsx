import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { User } from "@/ev-types/user-types";
import { useRouter } from "next/navigation";
import React from "react";

const LogoutButton = () => {
  const { UserDispatch } = useUserContext();
  const router = useRouter();
  const logout = () => {
    UserDispatch({
      type: "setUser",
      value: { authUser: null, fullUser: null, theme: Themes.light } as User,
    });
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={() => logout()} className="text-ev-text">
      Logout
    </button>
  );
};

export default LogoutButton;
