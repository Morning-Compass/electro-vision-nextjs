"use client";

import Themes from "@/mc-const/themes";
import { User as UserEntityType } from "@/mc-types/user-types";
import React, { ReactNode, createContext, useContext, useReducer } from "react";

type UserContextProviderProps = {
  children: ReactNode;
};

type UserAction =
  | {
      type: "setUsername";
      username: string;
    }
  | {
      type: "setTheme";
      theme: "light" | "dark";
    }
  | {
      type: "setProfilePicture";
      profilePicture: string;
    }
  | {
      type: "setEmail";
      email: string;
    }
  | {
      type: "setId";
      userId: string;
    };

const UserReducer = (
  state: UserEntityType,
  action: UserAction,
): UserEntityType => {
  switch (action.type) {
    case "setUsername":
      return { ...state, username: action.username };
    case "setTheme":
      return { ...state, theme: action.theme };
    case "setProfilePicture":
      return { ...state, profilePicture: action.profilePicture };
    case "setEmail":
      return { ...state, email: action.email };
    case "setId":
      return { ...state, userId: action.userId };
    default:
      return state;
  }
};

type UserContextType = {
  User: UserEntityType;
  UserDispatch: React.Dispatch<UserAction>;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [User, UserDispatch] = useReducer(UserReducer, {
    username: null,
    email: null,
    profilePicture: null,
    theme: Themes.light,
    userId: null,
    accountVerified: null,
    passwordLength: null,
    authorities: null,
    accountNonExpired: null,
    accountNonLocked: null,
    credentialsNonExpired: null,
  } as UserEntityType);

  return (
    <UserContext.Provider value={{ User, UserDispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("User context musnt be null");
  return context;
}
