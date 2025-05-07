const Regex = {
  password: /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>[\]\\\/`~'=_+\-]+$/,
  emailRegistration: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
  usernameModification: /^[a-zA-Z0-9_]+$/,
  username: /^[a-zA-Z0-9_]{6,20}$/,
};

export default Regex;
