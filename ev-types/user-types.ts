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
  created_at: Date | null;
  account_verified: boolean | null;
  roles: string[] | null;
  token: string | null;
};

export type FullUser = {
  auth_user_id: Pick<AuthUser, "id">;
  phone: string | null;
  phone_dial_code: string | null;
  title: string | null;
  education: string | null;
  birth_date: Date | null;
  account_bank_umber: string | null;
  profile_picture: string | null;
};

export type WorkspaceUser = {
  id: number;
  username: string;
  email: string;
  position: string | null;
  workspace_role: string;
};
