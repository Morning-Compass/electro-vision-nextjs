"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import { User, User as UserEntityType } from "@/ev-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import { LogOptions } from "vite";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import Regex from "@/ev-const/regex";
import AuthConst from "@/ev-const/authconst";
import Image from "next/image";
import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Login() {
  type FormProps = {
    credential: string;
    password: string;
  };

  const loginOptions = {
    email: "email",
    username: "username",
  } as const;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormProps>({
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [loginOption, setLoginOption] = useState<"email" | "username">("email");

  const { User, UserDispatch } = useUserContext();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    const loginLink =
      loginOption === loginOptions.email
        ? ApiLinks.loginEmail
        : ApiLinks.loginUsername;

    console.log(loginLink);

    try {
      const response = await OLF.post(loginLink, {
        [loginOption === loginOptions.email
          ? loginOptions.email
          : loginOptions.username]: data.credential,
        password: data.password,
      });

      const user: User = {
        authUser: {
          id: response.id,
          username: response.username,
          accountVerified: response.account_valid,
          email: response.email,
          token: response.token,
          createdAt: response.created_at,
          roles: response.roles,
        },
        fullUser: null,
        theme: Themes.light,
      };

      UserDispatch({ type: "setUser", value: user });
      toast.success("Login Successfull");
      router.push("/hub");
      router.refresh();
    } catch {}
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row justify-around text-mc-text bg-mc-primary w-[55vw] min-w-72 opacity-95 rounded-[1.5rem] mt-auto mb-auto mc-blur transition-colors duration-500 p-6 max-h-[75vh]">
        <Image
          src={"./login_register_image.svg"}
          className={"flex-1 w-[calc(50%-10em)] h-auto object-contain"}
          alt={"Login"}
          width={10}
          height={10}
        />
        <article className="flex flex-col items-center justify-between h-auto w-[50%] mt-28 mb-12">
          <header className="text-3xl font-bold mt-8 mb-8 mr-6 ml-6 text-center">
            Good to see you again!
          </header>
          <form
            className="flex flex-col items-stretch justify-between gap-4 h-[45%]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Email or Username</h1>
              <Input
                type="text"
                name="credential"
                placeholder="Email or Username"
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                error={errors.credential?.message}
                register={register("credential", {
                  validate: (cred) => {
                    if (cred && cred.includes("@")) {
                      setLoginOption("email");
                      const regexResult = Regex.emailRegistration.test(cred);
                      if (!regexResult) {
                        return "Email must be correct";
                      }
                      console.log("optin email");
                      return true;
                    }
                    setLoginOption("username");
                    console.log("optin username");
                  },
                  required: {
                    value: true,
                    message: "Credential is required",
                  },
                })}
              />
            </FormErrorWrap>
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Password</h1>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                error={errors.password?.message}
                register={register("password", {
                  minLength: {
                    value: AuthConst.minPasswordLength,
                    message: `Password must have at least ${AuthConst.minPasswordLength} characters`,
                  },
                  required: {
                    value: true,
                    message: "Password is required",
                  },
                })}
              />
            </FormErrorWrap>
            <Button
              type="submit"
              value="Login"
              customWidth="max-w-[40rem] min-w-56 w-[25vw]"
            />
          </form>
          <figure className="flex items-center justify-evenly p-6">
            <p className="select-none mr-4 ml-4 text-center">
              Don't have account?
            </p>
            <Link
              href={"/register"}
              className="text-mc-text hover:scale-110 duration-300 ml-4 mr-4 font-bold"
            >
              Register here
            </Link>
          </figure>
        </article>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
