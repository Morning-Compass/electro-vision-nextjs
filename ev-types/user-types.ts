export type User = {
  theme: string;
  authUser: AuthUser | null;
  fullUser: FullUser | null;
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
