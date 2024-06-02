const host = "http://localhost:8080";

const ApiLinks = {
  register: host + "/api/auth/register",
  loginEmail: host + "/api/auth/login/email",
  loginUsername: host + "/api/auth/login/username",
  validateAccount: host + "/api/auth/validate",
} as const;

export default ApiLinks;
