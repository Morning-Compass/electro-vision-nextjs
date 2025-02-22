"use client";

import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import Regex from "@/ev-const/regex";
import useUserContext from "@/ev-contexts/userContextProvider";
import { User as UserEntityType } from "@/ev-types/user-types";
import Image from "next/image";
import { ReactNode, useEffect, useReducer, useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import AuthConst from "@/ev-const/authconst";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import OLF from "@/ev-lib/ElectroVisionFetch";
import toast from "react-hot-toast";

const EditCredentialWrap = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row items-center justify-center">{children}</div>
  );
};

type Action = {
  type: string;
  value: string;
};

type ChangeCredentialAction =
  | {
      type: "setNewUsername";
      value: string | null;
    }
  | {
      type: "setNewEmail";
      value: string | null;
    }
  | {
      type: "setProfilePicture";
      value: string | null;
    }
  | {
      type: "setUsernameEditEnabled";
      value: boolean;
    }
  | {
      type: "setEmailEditEnabled";
      value: boolean;
    }
  | {
      type: "setAllEditDisabled";
    }
  | {
      type: "setNewPassword";
      value: string | null;
    }
  | {
      type: "setNewRepeatPassword";
      value: string | null;
    }
  | {
      type: "setNewPasswordEditEnabled";
      value: boolean;
    };

type ChangeCredentialUser = Pick<
  UserEntityType,
  "username" | "email" | "profilePicture"
> & {
  usernameEditEnabled: boolean;
  emailEditEnabled: boolean;
  newPassword: string | null;
  newRepeatPassword: string | null;
  newPasswordEditEnabled: boolean;
};

const changeCredentialReducer = (
  state: ChangeCredentialUser,
  action: ChangeCredentialAction,
): ChangeCredentialUser => {
  switch (action.type) {
    case "setNewUsername":
      return { ...state, username: action.value };
    case "setNewEmail":
      return { ...state, email: action.value };
    case "setProfilePicture":
      return { ...state, profilePicture: action.value };
    case "setUsernameEditEnabled":
      return { ...state, usernameEditEnabled: action.value };
    case "setEmailEditEnabled":
      return { ...state, emailEditEnabled: action.value };
    case "setAllEditDisabled":
      return {
        ...state,
        emailEditEnabled: false,
        usernameEditEnabled: false,
        newPasswordEditEnabled: false,
      };
    case "setNewPassword":
      return { ...state, newPassword: action.value };
    case "setNewRepeatPassword":
      return { ...state, newRepeatPassword: action.value };
    case "setNewPasswordEditEnabled":
      return { ...state, newPasswordEditEnabled: action.value };
  }
};

type ChangeCredentialUserForm = Pick<
  ChangeCredentialUser,
  "username" | "email" | "newPassword" | "newRepeatPassword"
>;

const AccountPage = () => {
  const { User, UserDispatch } = useUserContext();
  const [newCredentials, newCredentialsDispatch] = useReducer(
    changeCredentialReducer,
    {
      username: User.username,
      email: User.email,
      profilePicture: User.profilePicture,
      usernameEditEnabled: false,
      emailEditEnabled: false,
      newPassword: null,
      newRepeatPassword: null,
    } as ChangeCredentialUser,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<ChangeCredentialUserForm>();

  const onSubmit: SubmitHandler<ChangeCredentialUserForm> = async (data) => {
    try {
      await OLF.put("future change credentials", {
        token: "future jwt roken",
        credentials: data,
      });
      newCredentialsDispatch({ type: "setAllEditDisabled" });
      toast.success("Credentials changed successfully", { duration: 3000 });
    } catch (e) {
      toast.error("Changing credentials went wrong", { duration: 3000 });
    }
    console.log(data);
  };

  const handleUserProfilePictureSet = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        UserDispatch({
          type: "setProfilePicture",
          value: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserProfilePictureDelete = async () => {
    try {
      UserDispatch({ type: "setProfilePicture", value: null });
      await OLF.delete("future link to delete", {
        token: "future JWT token",
      });
    } catch (e) {
      toast.error("Deleting photo went wrong", { duration: 3000 });
    }
  };

  const setUserImage = async () => {
    try {
      if (!User.profilePicture) throw new Error();

      await OLF.post("future api link", {
        token: "future JWT token",
        user_image: User.profilePicture,
      });
    } catch (e) {
      toast.error("Setting photo went wrong", { duration: 3000 });
    }
  };

  const handleUserProfilePictureSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setUserImage();
  };

  const [prevUserImage, setPrevUserImage] = useState(User.profilePicture);

  useEffect(() => {
    if (User.profilePicture !== prevUserImage) {
      setPrevUserImage(User.profilePicture);
    }
  }, [User.profilePicture, prevUserImage]);

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-mc-text bg-mc-primary w-[45vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto transition-colors duration-500">
        {User.username && User.userId && User.email ? (
          <article className="flex flex-col items-center justify-center mt-12 mb-12 gap-12">
            <header className="text-3xl font-bold mt-8 mb-2 mr-6 ml-6 text-center">
              Electro Vision Settings
            </header>
            <figure className="mr-4 ml-4 flex items-center justify-center flex-col gap-6">
              <Image
                src={User.profilePicture ?? "/default-user.png"}
                alt="pfp"
                height={300}
                width={300}
                loading="lazy"
                className="rounded-full aspect-square"
              />
              <form onSubmit={handleUserProfilePictureSubmit}>
                <input
                  type="file"
                  name="file"
                  accept=".png, .jpg, .jpeg"
                  id="upload"
                  hidden={true}
                  onChange={handleUserProfilePictureSet}
                />
                {User.profilePicture !== prevUserImage ? (
                  <Button type="submit" value="OK" customWidth="w-14" />
                ) : null}
              </form>
              <div className="flex items-center justify-center gap-4">
                <label
                  htmlFor="upload"
                  className="flex items-center justify-center text-center bg-mc-yellow text-white min-w-24 min-h-8 w-[12vw] h-[3vh] font-bold rounded-2xl hover:scale-110 duration-300"
                >
                  Choose
                </label>
                <Button
                  type="button"
                  value="Delete"
                  className="flex items-center justify-center text-center bg-mc-yellow text-white min-w-24 min-h-8 w-[12vw] h-[3vh] font-bold rounded-2xl hover:scale-110 duration-300"
                  onClick={handleUserProfilePictureDelete}
                />
              </div>
            </figure>
            <figure>
              <form
                className="flex flex-col items-start justify-center gap-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <EditCredentialWrap>
                  <div className="flex flex-col gap-1 text-wrap text-left text">
                    <FormErrorWrap>
                      <input
                        {...register("username", {
                          minLength: {
                            value: AuthConst.minUsernameLength,
                            message: `Username must have at least ${AuthConst.minUsernameLength} characters`,
                          },
                          maxLength: {
                            value: AuthConst.maxUsernameLength,
                            message: `Username must have less than ${AuthConst.maxUsernameLength} characters`,
                          },
                          validate: (username) => {
                            if (!newCredentials.usernameEditEnabled)
                              return true;
                            const regexResult = Regex.usernameModification.test(
                              username ?? "",
                            );
                            if (!regexResult) {
                              return "Username must have only numbers letters and _";
                            }
                            return true;
                          },
                        })}
                        type="text"
                        placeholder={newCredentials.username ?? User.username}
                        disabled={!newCredentials.usernameEditEnabled}
                        className={`border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800 ${newCredentials.usernameEditEnabled ? "border-6 border-emerald-500" : ""}`}
                      />
                      <FormErrorParahraph errorObject={errors.username} />
                    </FormErrorWrap>
                  </div>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() => {
                      if (newCredentials.usernameEditEnabled) {
                        setValue("username", "");
                      }
                      newCredentialsDispatch({
                        type: "setUsernameEditEnabled",
                        value: !newCredentials.usernameEditEnabled,
                      });
                    }}
                  >
                    <Image
                      src={"/cogwheel.png"}
                      width={32}
                      height={32}
                      alt="E"
                    />
                  </div>
                </EditCredentialWrap>
                <EditCredentialWrap>
                  <FormErrorWrap>
                    <input
                      type="email"
                      {...register("email", {
                        validate: (email) => {
                          if (!newCredentials.emailEditEnabled) return true;
                          const emailRegexResult = Regex.emailRegistration.test(
                            email ?? "",
                          );
                          if (!emailRegexResult) {
                            return "Email must be correct";
                          }
                          return true;
                        },
                      })}
                      placeholder={newCredentials.email ?? User.email}
                      disabled={!newCredentials.emailEditEnabled}
                      className={`border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800 ${newCredentials.emailEditEnabled ? "border-6 border-emerald-500" : ""}`}
                    />
                    <FormErrorParahraph errorObject={errors.email} />
                  </FormErrorWrap>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() => {
                      if (newCredentials.emailEditEnabled) {
                        setValue("email", "");
                      }
                      newCredentialsDispatch({
                        type: "setEmailEditEnabled",
                        value: !newCredentials.emailEditEnabled,
                      });
                    }}
                  >
                    <Image
                      src={"/cogwheel.png"}
                      width={32}
                      height={32}
                      alt="E"
                    />
                  </div>
                </EditCredentialWrap>
                <EditCredentialWrap>
                  <FormErrorWrap>
                    <input
                      type="password"
                      {...register("newPassword", {
                        minLength: {
                          value: AuthConst.minPasswordLength,
                          message: `Password Must have at least ${AuthConst.minPasswordLength} characters`,
                        },
                        validate: (password) => {
                          if (!newCredentials.newPasswordEditEnabled)
                            return true;
                          const passwordRegexResult = Regex.password.test(
                            password ?? "",
                          );
                          if (!passwordRegexResult || !password) {
                            return "Password must have letters numbers and special charachters";
                          }
                          if (password?.toLowerCase() === password) {
                            return "Password must have at least one capital letter";
                          }
                          if (!/\d/.test(password)) {
                            return "Password must have at least one number";
                          }
                          if (
                            !/[!@#$%^&*(),.?":{}|<>[\]\\\/`~'=_+\-]/.test(
                              password,
                            )
                          ) {
                            return "Password must contain at least one special character";
                          }
                          if (password !== getValues().newRepeatPassword) {
                            return "Passwords must match";
                          }
                          return true;
                        },
                      })}
                      placeholder="New Password"
                      disabled={!newCredentials.newPasswordEditEnabled}
                      className={`border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800 ${newCredentials.newPasswordEditEnabled ? "border-6 border-emerald-500" : ""}`}
                    />
                    {newCredentials.newPasswordEditEnabled ? (
                      <input
                        type="password"
                        {...register("newRepeatPassword", {
                          minLength: {
                            value: AuthConst.minPasswordLength,
                            message: `Password Must have at least ${AuthConst.minPasswordLength} characters`,
                          },
                          validate: (rep) => {
                            if (
                              (getValues().newPassword !== "" ||
                                getValues().newPassword !== null) &&
                              (rep === "" || rep === null)
                            ) {
                              return "Password repetition is required";
                            }
                            return true;
                          },
                        })}
                        placeholder="New Repeat Password"
                        disabled={!newCredentials.newPasswordEditEnabled}
                        className={`border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800 ${newCredentials.newPasswordEditEnabled ? "border-6 border-emerald-500" : ""}`}
                      />
                    ) : null}
                    <FormErrorParahraph errorObject={errors.newPassword} />
                  </FormErrorWrap>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() => {
                      if (newCredentials.newPasswordEditEnabled) {
                        setValue("newPassword", "");
                        setValue("newRepeatPassword", "");
                      }
                      newCredentialsDispatch({
                        type: "setNewPasswordEditEnabled",
                        value: !newCredentials.newPasswordEditEnabled,
                      });
                    }}
                  >
                    <Image
                      src={"/cogwheel.png"}
                      width={32}
                      height={32}
                      alt="E"
                    />
                  </div>
                </EditCredentialWrap>

                {newCredentials.usernameEditEnabled ||
                newCredentials.emailEditEnabled ||
                newCredentials.newPasswordEditEnabled ? (
                  <Button type="submit" value="OK" customWidth="w-14" />
                ) : null}
              </form>
            </figure>
          </article>
        ) : (
          <header className="text-3xl font-bold mt-8 mb-8 mr-6 ml-6 text-center">
            You need to login first!
          </header>
        )}
      </section>
      <FooterSmall />
    </PageTemplate>
  );
};

export default AccountPage;
