const host = "http://localhost:3501";

const ApiLinks = {
  register: host + "/auth/register",
  loginEmail: host + "/auth/login/email",
  loginUsername: host + "/auth/login/username",
  validateAccount: host + "/auth/validate/account",
  resetPasswordRequest: host + "/auth/reset/password/", //token after /
  resetPassword: host + "/auth/reset/password",
  verifySession: host + "/auth/validate/session",
  createWorkspace: host + "/create/workspace",
} as const;

export default ApiLinks;
