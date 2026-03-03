import { Task, Workspace, WorkspaceUser } from "./workspace-types";
export type { WorkspaceUser };

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
  phone: string | null;
  phone_dial_code: string | null;
  title: string | null;
  education: string | null;
  birth_date: Date | null;
  account_bank_number: string | null;
  profile_picture: string | null;
  county_of_origin: string | null;
  citizenships_countries_iso3: string[] | null;
};

