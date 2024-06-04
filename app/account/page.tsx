"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import Regex from "@/mc-const/regex";
import useUserContext from "@/mc-contexts/userContextProvider";
import { User as UserEntityType } from "@/mc-types/user-types";
import Image from "next/image";
import { useReducer, useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";

enum changeCredentialTypes {
  changeUsername = "changeUsername",
}

type changeCredentialAction = {
  type: changeCredentialTypes;
  payload: string;
};

type changeCredentialState = {
  newUsername: string;
  newEmail: string;
};

const changeCredentialReducer = (
  state: changeCredentialState,
  action: changeCredentialAction,
) => {
  const { type, payload } = action;
  switch (type) {
    case changeCredentialTypes.changeUsername:
      return {
        ...state,
        newUsername: payload,
      };
    default:
      return state;
  }
};

type NewUserCredentials = UserEntityType & {};

type ChangeCredentialsValues = {
  newUsername: string;
  newEmail: string;
};

const resolver: Resolver<ChangeCredentialsValues> = async (values) => {
  return {
    values: values.newUsername ? values : {},
    errors: !values.newUsername.match(Regex.usernameModification)
      ? {
          newUsername: {
            type: "validate",
            message:
              "Username must consist of letters, numbers, underscores, be maximum 20 chars long",
          },
        }
      : {},
  };
};

const AccountPage = () => {
  const { User } = useUserContext();
  const [usernameEditEnabled, setUsernameEditEnabled] = useState(false);
  const [newCredentials, redispatch] = useReducer(changeCredentialReducer, {
    newUsername: User.username ?? "",
    newEmail: "email",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeCredentialsValues>({ resolver });
  const onSubmit = handleSubmit((data) => console.log(data));

  // Example dispatch usage
  const handleChangeUsername = (newUsername: string) => {
    redispatch({
      type: changeCredentialTypes.changeUsername,
      payload: newUsername,
    });
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-mc-text bg-mc-primary w-[40vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto">
        {User.username && User.userId ? (
          <article className="flex flex-col items-center justify-center mt-12 mb-12">
            <header className="text-3xl font-bold mt-8 mb-8 mr-6 ml-6 text-center">
              Morning Compass Settings
            </header>
            <figure>
              <form
                className="flex flex-col items-start justify-center gap-2"
                onSubmit={onSubmit}
              >
                <div className="flex flex-row items-center justify-center">
                  <input
                    {...register("newUsername")}
                    placeholder="Change Username"
                    disabled={!usernameEditEnabled}
                    className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                  />
                  {errors?.newUsername && <p>{errors.newUsername.message}</p>}
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
