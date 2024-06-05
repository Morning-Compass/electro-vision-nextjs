const Regex = {
  passwordRegistration: "/^[a-z0-9]*$/",
  emailRegistration: `/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/`,
  usernameModification: `/^[a-zA-Z0-9_]{0,20}$/`,
};

export default Regex;
