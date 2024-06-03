"use client";

import Themes from "@/mc-const/themes";
import { User as UserEntityType } from "@/mc-types/user-types";
import React, { ReactNode, createContext, useContext, useState } from "react";

type UserContextProviderProps = {
  children: ReactNode;
};

type StateType<T> = React.Dispatch<React.SetStateAction<T>>;

type UserType = UserEntityType & {
  setUsername: StateType<UserEntityType["username"] | null>;
  setProfilePicture: StateType<UserEntityType["profilePicture"] | null>;
  setTheme: StateType<UserEntityType["theme"]>;
  setUserId: StateType<UserEntityType["userId"] | null>;
};

type UserContextType = {
  User: UserType;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [uname, setUname] = useState<UserType["username"] | null>(null);
  const [pfp, setPfp] = useState<UserType["profilePicture"] | null>(null);
  const [utheme, setUtheme] = useState<UserType["theme"]>(Themes.light);
  const [uId, setUId] = useState<UserType["userId"] | null>(null);

  const User: UserType = {
    username: uname,
    setUsername: setUname,
    profilePicture: pfp,
    setProfilePicture: setPfp,
    theme: utheme,
    setTheme: setUtheme,
    userId: uId,
    setUserId: setUId,
  };

  return (
    <UserContext.Provider value={{ User }}>{children}</UserContext.Provider>
  );
};

export default function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("User context musnt be null");
  return context;
}
