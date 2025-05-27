import Dashboard from "@/app/hub/page";

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
  addPythonTask: pythonHost + "/tasks/add-task",
  listPythonTasks: (workspaceId: string) => {
    return pythonHost + "/tasks/list-tasks-by-workspace/" + workspaceId;
  },
  updatePythonTask: () => {
    return pythonHost + "/tasks/update-task/";
  },
  removePythonTask: (workspaceId: string, taskId: string) => {
    return (
      pythonHost + "/tasks/delete-task-by-task-id/" + workspaceId + "/" + taskId
    );
  },
  invitationWorkerAccept: (token: string) => {
    return rustHost + "/workspace/invitation/accept/" + token;
  },
  listTasks: (id: string) => {
    return rustHost + "/workspace/" + id + "/tasks/list";
  },
  createTasks: (id: string) => {
    return rustHost + "/workspace/" + id + "/tasks/create";
  },
  updateTask: (workspaceId: string, taskId: string) => {
    return rustHost + "/workspace/" + workspaceId + "/tasks/update/" + taskId;
  },
  removeTask: (workspaceId: string, taskId: string) => {
    return rustHost + "/workspace/" + workspaceId + "/tasks/delete/" + taskId;
  },
  dashboard: rustHost + "/workspace/dashboard",
  registerUserProfile: rustHost + "/user/register",
  updateUserProfile: rustHost + "/user/update",
  listUserProfile: rustHost + "/user/list",
  removeUserProfile: (id: string) => {
    return rustHost + "/user/delete/" + id;
  },
  removeWorkspace: (id: string) => {
    return rustHost + "/workspace/" + id;
  },

  // removeWorker: ()
} as const;

export default ApiLinks;
