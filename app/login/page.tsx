"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import OLF from "@/mc-lib/OneLastFetch";
import ApiLinks from "@/mc-const/api-links";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import { User as UserEntityType } from "@/mc-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import { LogOptions } from "vite";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import Regex from "@/mc-const/regex";
import AuthConst from "@/mc-const/authconst";

export default function Login() {
  type formProps = {
    credential: string | null;
    password: string | null;
  };

  const loginOptions = {
    email: "email",
    username: "username",
  } as const;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setError,
  } = useForm<formProps>();

  const [loginOption, setLoginOption] = useState<"email" | "username">("email");

  const onSubmit: SubmitHandler<formProps> = async (data) => {
    const loginLink =
      loginOption === loginOptions.email
        ? ApiLinks.loginEmail
        : ApiLinks.loginUsername;

    const response = await OLF.post(loginLink, {
      [loginOption === loginOptions.email
        ? loginOptions.email
        : loginOptions.username]: getValues().credential,
      password: getValues().password,
    });
    redirect("/");
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-mc-text bg-mc-primary w-[40vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto">
        <article className="flex flex-col items-center justify-center mt-12 mb-12">
          <header className="text-3xl font-bold mt-8 mb-8 mr-6 ml-6 text-center">
            Login to your Morning Compass account
          </header>
          <form
            className="flex flex-col items-center justify-center gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormErrorWrap>
              <input
                {...register("credential", {
                  validate: (cred) => {
                    if (cred && cred.includes("@")) {
                      const regexResult = Regex.emailRegistration.test(cred);
                      if (!regexResult) {
                        return "Email must be correct";
                      }
                      return true;
                    }
                  },
                  required: {
                    value: true,
                    message: "Credential is required",
                  },
                })}
                type="text"
                placeholder="Email or Username"
                name="credential"
                className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.credential} />
            </FormErrorWrap>
            <FormErrorWrap>
              <input
                {...register("password", {
                  minLength: {
                    value: AuthConst.minPasswordLength,
                    message: `Password must have at least ${AuthConst.minPasswordLength} characters`,
                  },
                  required: {
                    value: true,
                    message: "Password is requiered",
                  },
                })}
                type="password"
                placeholder="Password"
                name="password"
                className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.password} />
            </FormErrorWrap>
            <Button type="submit" value="Login" />
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
