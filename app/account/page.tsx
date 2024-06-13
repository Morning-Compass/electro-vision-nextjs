"use client";

import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import Regex from "@/mc-const/regex";
import useUserContext from "@/mc-contexts/userContextProvider";
import { User as UserEntityType } from "@/mc-types/user-types";
import Image from "next/image";
import { useReducer, useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import AuthConst from "@/mc-const/authconst";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import OLF from "@/mc-lib/OneLastFetch";
import toast from "react-hot-toast";

type Action = {
  type: string;
  value: string;
};

type ChangeCredentialAction =
  | {
      type: "setNewUsername";
      value: string;
    }
  | {
      type: "setNewEmail";
      value: string;
    }
  | {
      type: "setProfilePicture";
      value: string;
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
    };

type ChangeCredentialUser = Pick<
  UserEntityType,
  "username" | "email" | "profilePicture"
> & {
  usernameEditEnabled: boolean;
  emailEditEnabled: boolean;
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
      return { ...state, emailEditEnabled: false, usernameEditEnabled: false };
  }
};

type ChangeCredentialUserForm = Pick<
  ChangeCredentialUser,
  "username" | "email"
>;

const AccountPage = () => {
  const { User, UserDispatch } = useUserContext();
  const [newCredentials, newCredentialsDispatch] = useReducer(
    changeCredentialReducer,
    {
      username: User.username ?? "",
      email: User.email ?? "",
      profilePicture: User.profilePicture ?? "",
      usernameEditEnabled: false,
      emailEditEnabled: false,
    } as ChangeCredentialUser,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeCredentialUserForm>();

  const onSubmit: SubmitHandler<ChangeCredentialUserForm> = (data) => {
    newCredentialsDispatch({ type: "setAllEditDisabled" });
    console.log(data);
  };

  const setUserImage = async (token: string, base64Image: string) => {
    try {
      console.log(base64Image);
      UserDispatch({ type: "setProfilePicture", value: base64Image });
      await OLF.post("future api link", {
        token: token,
        user_image: base64Image,
      });
    } catch (e) {
      toast.error("Setting photo went wrong", { duration: 3000 });
    }
  };

  const handleUserProfilePictureSet = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        setUserImage("future JWT token", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserProfilePictureDelete = async () => {
    try {
      UserDispatch({ type: "setProfilePicture", value: null });
      await OLF.delete("future link to delete", { token: "future JWT token" });
    } catch (e) {
      toast.error("Deleting photo went wrong", { duration: 3000 });
    }
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-mc-text bg-mc-primary w-[40vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto">
        {User.username && User.userId && User.email ? (
          <article className="flex flex-col items-center justify-center mt-12 mb-12 gap-12">
            <header className="text-3xl font-bold mt-8 mb-2 mr-6 ml-6 text-center">
              Morning Compass Settings
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
              <input
                type="file"
                name="file"
                accept=".png, .jpg, .jpeg"
                id="upload"
                hidden={true}
                onChange={handleUserProfilePictureSet}
              />
              <div className="flex items-center justify-center gap-4">
                <label
                  htmlFor="upload"
                  className="flex items-center justify-center text-center bg-mc-yellow text-white min-w-24 min-h-8 w-[12vw] h-[3vh] font-bold rounded-2xl hover:scale-110 duration-300"
                >
                  Choose...
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
                <div className="flex flex-row items-center justify-center">
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
                        className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                      />
                      <FormErrorParahraph errorObject={errors.username} />
                    </FormErrorWrap>
                  </div>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() =>
                      newCredentialsDispatch({
                        type: "setUsernameEditEnabled",
                        value: !newCredentials.usernameEditEnabled,
                      })
                    }
                  >
                    <Image
                      src={"/settings.png"}
                      width={32}
                      height={32}
                      alt="E"
                    />
                  </div>
                </div>
                <div className="flex flex-row items-center justify-center">
                  <div className="flex flex-col gap-1 text-wrap text-left">
                    <FormErrorWrap>
                      <input
                        type="email"
                        {...register("email", {
                          validate: (email) => {
                            if (!newCredentials.emailEditEnabled) return true;
                            const emailRegexResult =
                              Regex.emailRegistration.test(email ?? "");
                            if (!emailRegexResult) {
                              return "Email must be correct";
                            }
                            return true;
                          },
                        })}
                        placeholder={newCredentials.email ?? User.email}
                        disabled={!newCredentials.emailEditEnabled}
                        className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                      />
                      <FormErrorParahraph errorObject={errors.email} />
                    </FormErrorWrap>
                  </div>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() =>
                      newCredentialsDispatch({
                        type: "setEmailEditEnabled",
                        value: !newCredentials.emailEditEnabled,
                      })
                    }
                  >
                    <Image
                      src={"/settings.png"}
                      width={32}
                      height={32}
                      alt="E"
                    />
                  </div>
                </div>
                {newCredentials.usernameEditEnabled ||
                newCredentials.emailEditEnabled ? (
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
