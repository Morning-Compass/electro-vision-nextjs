const rustHost = "http://localhost:3501";
const pythonHost = "http://localhost:8080";

const ApiLinks = {
  register: rustHost + "/auth/register",
  loginEmail: rustHost + "/auth/login/email",
  loginUsername: rustHost + "/auth/login/username",
  validateAccount: rustHost + "/auth/validate/account",
  resetPasswordRequest: rustHost + "/auth/reset/password/", //token after /
  resetPassword: rustHost + "/auth/reset/password",
  verifySession: rustHost + "/auth/validate/session",
  createWorkspace: rustHost + "/create/workspace",
  uploadImage: pythonHost + "/images/upload/",
} as const;

export default ApiLinks;
