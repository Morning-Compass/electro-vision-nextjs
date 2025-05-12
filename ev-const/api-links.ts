const rustHost = "http://localhost:3501";
const pythonHost = "http://localhost:8000";

const ApiLinks = {
  register: rustHost + "/auth/register",
  loginEmail: rustHost + "/auth/login/email",
  loginUsername: rustHost + "/auth/login/username",
  validateAccount: rustHost + "/auth/validate/account",
  resetPasswordRequest: rustHost + "/auth/reset/password/", //token after /
  resetPassword: rustHost + "/auth/reset/password",
  verifySession: rustHost + "/auth/validate/session",
  createWorkspace: rustHost + "/workspace/create",
  uploadImage: pythonHost + "/images/upload/",
  listWorkspaces: rustHost + "/workspace/list",
  listWorkspaceUsersByWorkspaceIdAndEmail: (id: string) => {
    return rustHost + "/workspace/" + id + "/users/list";
  },
  listFiles: pythonHost + "/images/list-files/",
  retrieveFiles: pythonHost + "/images/all-files",
  removeFile: pythonHost + "/images/remove-file",
  inviteWorker: rustHost + "/workspace/invitation/create",
  invitationWorkerAccept: (token: string) => {
    return rustHost + "/workspace/invitation/accept/" + token;
  },
  listTasks: (id: string) => {
    return rustHost + "/workspace/" + id + "/tasks/list";
  },
  createTasks: (id: string) => {
    return rustHost + "/workspace/" + id + "/tasks/create";
  },
} as const;

export default ApiLinks;
