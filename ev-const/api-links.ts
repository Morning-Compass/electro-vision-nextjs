const host = "http://localhost:3501";

const ApiLinks = {
  register: host + "/register",
  loginEmail: host + "/login-email",
  loginUsername: host + "/login-username",
  validateAccount: host + "/validate",
  resetPasswordRequest: host + "/reset_password",
  resetPassword: host + "/reset_password",
  verifySession: host + "/verify_session",
  createWorkspace: host + "/create_workspace",
} as const;

export default ApiLinks;
