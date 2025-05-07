import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { User } from "@/ev-types/user-types";
import React from "react";

const LogoutButton = () => {
  const { UserDispatch } = useUserContext();
  const logout = () => {
    UserDispatch({
      type: "setUser",
      value: { authUser: null, fullUser: null, theme: Themes.light } as User,
    });
  };

  return (
    <button onClick={() => logout()} className="">
      Logout
    </button>
  );
};

export default LogoutButton;
