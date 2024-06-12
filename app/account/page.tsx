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
    };

type ChangeCredentialUser = Pick<
  UserEntityType,
  "username" | "email" | "profilePicture"
>;

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
  }
};

type ChangeCredentialUserForm = Pick<
  ChangeCredentialUser,
  "username" | "email"
>;

const AccountPage = () => {
  const { User, UserDispatch } = useUserContext();
  const [usernameEditEnabled, setUsernameEditEnabled] = useState(false);
  const [newCredentials, dispatch] = useReducer(changeCredentialReducer, {
    username: User.username ?? "",
    email: User.email ?? "",
    profilePicture: User.profilePicture ?? "",
  } as ChangeCredentialUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeCredentialUserForm>();

  const onSubmit: SubmitHandler<ChangeCredentialUserForm> = (data) => {
    console.log(data);
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-mc-text bg-mc-primary w-[40vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto">
        {User.username && User.userId && User.email ? (
          <article className="flex flex-col items-center justify-center mt-12 mb-12">
            <header className="text-3xl font-bold mt-8 mb-8 mr-6 ml-6 text-center">
              Morning Compass Settings
            </header>
            <figure>
              <form
                className="flex flex-col items-start justify-center gap-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-row items-center justify-center">
                  <div className="flex flex-col gap-1 text-wrap text-left text">
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
                      disabled={!usernameEditEnabled}
                      className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                    />
                    {errors.username && (
                      <p className="text-rose-800">{errors.username.message}</p>
                    )}
                  </div>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() => setUsernameEditEnabled((p) => !p)}
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
                    <input
                      type="email"
                      {...register("email", {
                        validate: (email) => {
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
                      disabled={!usernameEditEnabled}
                      className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                    />
                    {errors.email && (
                      <p className="text-rose-800">{errors.email.message}</p>
                    )}
                  </div>
                  <div
                    className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                    onClick={() => setUsernameEditEnabled((p) => !p)}
                  >
                    <Image
                      src={"/settings.png"}
                      width={32}
                      height={32}
                      alt="E"
                    />
                  </div>
                </div>
                {usernameEditEnabled ? (
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
