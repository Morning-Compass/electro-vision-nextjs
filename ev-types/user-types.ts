import { Task, Workspace } from "./workspace-types";

export type User = {
  theme: string;
  authUser: AuthUser | null;
  fullUser: FullUser | null;
  workspaceData: WorkspaceData | null;
};

export type WorkspaceData = {
  currentWorkspace: Workspace | null;
  currentTask: Task | null;
  users: WorkspaceUser[] | null;
  currentUserId: number | null;
  // currentProblem: Problem | null;
  currentUserOverviewData: {
    id: string;
    email: string;
  } | null;
};

export type AuthUser = {
  id: string | null;
  username: string | null;
  email: string | null;
  createdAt: Date | null;
  accountVerified: boolean | null;
  roles: string[] | null;
  token: string | null;
};

export type FullUser = {
  authUserId: Pick<AuthUser, "id">;
  phone: string | null;
  phoneDialCode: string | null;
  title: string | null;
  education: string | null;
  birthDate: Date | null;
  accountBankNumber: string | null;
  profile_picture: string | null;
};

export type WorkspaceUser = {
  id: number;
  username: string;
  email: string;
  position: string | null;
  workspaceRole: string;
};
