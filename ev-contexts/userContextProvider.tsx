"use client";

import Themes from "@/ev-const/themes";
import {
  AuthUser,
  FullUser,
  User as UserEntityType,
  WorkspaceData,
} from "@/ev-types/user-types";
import { Workspace } from "@/ev-types/workspace-types";
import React, { ReactNode, createContext, useContext, useReducer } from "react";

type UserContextProviderProps = {
  children: ReactNode;
};

// Update UserAction type to properly handle workspaces
type UserAction =
  | { type: "setUsername"; value: string | null }
  | { type: "setTheme"; value: "light" | "dark" }
  | { type: "setProfilePicture"; value: string | null }
  | { type: "setEmail"; value: string | null }
  | { type: "setId"; value: string | null }
  | { type: "setAuthUser"; value: AuthUser | null }
  | { type: "setFullUser"; value: FullUser | null }
  | { type: "setUser"; value: UserEntityType }
  | { type: "setWorkspaceData"; value: WorkspaceData | null };

// Update UserEntityType to include currentWorkspace
declare module "@/ev-types/user-types" {
  interface UserEntityType {
    currentWorkspace?: Workspace | null;
  }
}

const UserReducer = (
  state: UserEntityType,
  action: UserAction,
): UserEntityType => {
  switch (action.type) {
    case "setWorkspaceData":
      return {
        ...state,
        workspaceData: action.value,
      };
    // Other cases remain the same
    case "setUsername":
      return {
        ...state,
        authUser: state.authUser
          ? { ...state.authUser, username: action.value }
          : null,
      };
    case "setTheme":
      return { ...state, theme: action.value };
    case "setProfilePicture":
      return {
        ...state,
        fullUser: state.fullUser
          ? { ...state.fullUser, profile_picture: action.value }
          : null,
      };
    case "setEmail":
      return {
        ...state,
        authUser: state.authUser
          ? { ...state.authUser, email: action.value }
          : null,
      };
    case "setId":
      return {
        ...state,
        authUser: state.authUser
          ? { ...state.authUser, id: action.value }
          : null,
      };
    case "setAuthUser":
      return { ...state, authUser: action.value };
    case "setFullUser":
      return { ...state, fullUser: action.value };
    case "setUser":
      return { ...action.value };
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
    theme: Themes.light,
    passwordLength: null,
    authUser: null,
    fullUser: null,
    currentWorkspace: null,
    workspaceData: null,
  } as UserEntityType);

  return (
    <UserContext.Provider value={{ User, UserDispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("User context must not be null");
  return context;
}
