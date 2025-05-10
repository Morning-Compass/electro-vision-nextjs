"use client";

import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import Regex from "@/ev-const/regex";
import useUserContext from "@/ev-contexts/userContextProvider";
import Image from "next/image";
import { ReactNode, useEffect, useReducer, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import AuthConst from "@/ev-const/authconst";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import OLF from "@/ev-lib/ElectroVisionFetch";
import toast from "react-hot-toast";
import ContentBlock from "@/components/ContentBlock";

const EditCredentialWrap = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-row items-center justify-center">{children}</div>
);

type ChangeCredentialAction =
  | { type: "setNewUsername"; value: string | null }
  | { type: "setNewEmail"; value: string | null }
  | { type: "setProfilePicture"; value: string | null }
  | { type: "setUsernameEditEnabled"; value: boolean }
  | { type: "setEmailEditEnabled"; value: boolean }
  | { type: "setAllEditDisabled" };

type ChangeCredentialUser = {
  username: string | null;
  email: string | null;
  profilePicture: string | null;
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
    default:
      return state;
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
      username: User.authUser?.username,
      email: User.authUser?.email,
      profilePicture: User.fullUser?.profile_picture,
      usernameEditEnabled: false,
      emailEditEnabled: false,
    } as ChangeCredentialUser,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<ChangeCredentialUserForm>({
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<ChangeCredentialUserForm> = async (data) => {
    try {
      await OLF.put("future change credentials", {
        token: "future jwt token",
        credentials: data,
      });
      newCredentialsDispatch({ type: "setAllEditDisabled" });
      toast.success("Credentials changed successfully", { duration: 3000 });
    } catch (e) {
      toast.error("Changing credentials went wrong", { duration: 3000 });
    }
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
      if (!User.fullUser?.profile_picture) throw new Error();
      await OLF.post("future api link", {
        token: "future JWT token",
        user_image: User.fullUser?.profile_picture,
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

  const [prevUserImage, setPrevUserImage] = useState(
    User.fullUser?.profile_picture,
  );

  useEffect(() => {
    if (User.fullUser?.profile_picture !== prevUserImage) {
      setPrevUserImage(User.fullUser?.profile_picture);
    }
  }, [User.fullUser?.profile_picture, prevUserImage]);

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-ev-text bg-mc-primary w-[45vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto transition-colors duration-500">
        <ContentBlock>
          <article className="flex flex-col items-center justify-center mt-12 mb-12 gap-12">
            <header className="text-3xl font-bold mt-8 mb-2 mr-6 ml-6 text-center">
              Electro Vision Settings
            </header>
            <figure className="mr-4 ml-4 flex items-center justify-center flex-col gap-6">
              <Image
                src={User.fullUser?.profile_picture ?? "/default-user.png"}
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
                {User.fullUser?.profile_picture !== prevUserImage ? (
                  <Button type="submit" value="OK" customWidth="w-14" />
                ) : null}
              </form>
              <div className="flex items-center justify-center gap-4">
                <label
                  htmlFor="upload"
                  className="flex items-center justify-center text-center bg-ev-blue text-ev-white min-w-24 min-h-8 w-[12vw] h-[3vh] font-bold rounded-xl hover:scale-110 duration-300"
                >
                  Choose
                </label>
                <Button
                  type="button"
                  value="Delete"
                  className="flex items-center justify-center text-center bg-ev-blue text-white min-w-24 min-h-8 w-[12vw] h-[3vh] font-bold rounded-xl hover:scale-110 duration-300"
                  onClick={handleUserProfilePictureDelete}
                />
              </div>
            </figure>
            <figure>
              <form
                className="flex flex-col items-center justify-center gap-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <EditCredentialWrap>
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
                          if (!newCredentials.usernameEditEnabled) return true;
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
                      placeholder="New Username"
                      disabled={!newCredentials.usernameEditEnabled}
                      className={`border-4 bg-ev-primary-bg text-ev-text border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800 ${newCredentials.usernameEditEnabled ? "border-6 border-emerald-500" : ""}`}
                    />
                    <FormErrorParahraph errorObject={errors.username} />
                  </FormErrorWrap>
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
                      className="duration-300 hover:scale-125"
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
                      placeholder="New Email"
                      disabled={!newCredentials.emailEditEnabled}
                      className={`border-4 bg-ev-primary-bg text-ev-text border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800 ${newCredentials.usernameEditEnabled ? "border-6 border-emerald-500" : ""}`}
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
                      className="duration-300 hover:scale-125"
                    />
                  </div>
                </EditCredentialWrap>
                {(newCredentials.usernameEditEnabled ||
                  newCredentials.emailEditEnabled) && (
                  <Button
                    type="submit"
                    value="OK"
                    additionalClassName="duration-300 hover:scale-110"
                  />
                )}
              </form>
            </figure>
          </article>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
};

export default AccountPage;
