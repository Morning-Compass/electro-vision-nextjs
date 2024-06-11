const Regex = {
  passwordRegistration: /^[a-zA-Z0-9_]+$/,
  emailRegistration:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  usernameModification: /^[a-zA-Z0-9_]$/,
};

export default Regex;
