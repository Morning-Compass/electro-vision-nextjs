"use client";

import { useState } from "react";
import OLF from "@/mc-lib/OneLastFetch";
import ApiLinks from "@/mc-const/api-links";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import { User as UserEntityType } from "@/mc-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import AuthConst from "@/mc-const/authconst";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import Regex from "@/mc-const/regex";

export default function Login() {
  type formProps = Pick<UserEntityType, "email" | "username"> & {
    password: string | null;
    repPassword: string | null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setError,
  } = useForm<formProps>();

  const onSubmit: SubmitHandler<formProps> = async (data) => {
    const response = await OLF.post(ApiLinks.register, {
      username: data.username,
      email: data.email,
      password: data.password,
    });
  };

  // const inputStyles = { inputSecurity: showPassword ? "none" : "inherit", }
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-col items-center justify-center text-mc-text bg-mc-primary w-[40vw] min-w-72 opacity-95 rounded-[3rem] mt-auto mb-auto mc-blur">
        <article className="flex flex-col items-center justify-center mt-12 mb-12">
          <header className="text-3xl font-bold mb-8 mt-8 mr-2 ml-2 text-center">
            Create Morning Compass account
          </header>
          <form
            className="flex flex-col items-center justify-center gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormErrorWrap>
              <input
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
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                })}
                type="text"
                placeholder="Email"
                name="email"
                className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.email} />
            </FormErrorWrap>
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
                  required: {
                    value: true,
                    message: "Username is required",
                  },
                })}
                type="text"
                placeholder="Username"
                name="username"
                className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.username} />
            </FormErrorWrap>
            <FormErrorWrap>
              <input
                {...register("password", {
                  minLength: {
                    value: AuthConst.minPasswordLength,
                    message: `Password Must have at least ${AuthConst.minPasswordLength} characters`,
                  },
                  required: {
                    value: true,
                    message: "Password is required",
                  },
                })}
                type="password"
                placeholder="Password"
                name="password"
                className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.password} />
            </FormErrorWrap>
            <FormErrorWrap>
              <input
                {...register("repPassword", {
                  required: {
                    value: true,
                    message: "Password repeat is required",
                  },
                  minLength: {
                    value: AuthConst.minPasswordLength,
                    message: `Password Must have at least ${AuthConst.minPasswordLength} characters`,
                  },
                  validate: (rep) => {
                    if (getValues().password !== rep) {
                      return "Passwords Must Match";
                    }
                    return true;
                  },
                })}
                type="password"
                placeholder="Repeat Password"
                name="repPassword"
                className="border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.repPassword} />
            </FormErrorWrap>
            <Button type="submit" value="Register" />
            {/* <div onClick={() => setShowPassword(p => !p)} className="w-4 h-4 text-center border-solid border-black rounded-[100%] cursor-pointer">x</div> */}
          </form>
          <figure className="flex flex-row items-center justify-center m-6">
            <p className="select-none ml-4 mr-4 text-center">
              Already have account?
            </p>
            <Link
              href={"/login"}
              className="text-mc-text font-medium hover:scale-110 duration-300 ml-4 mr-4"
              font-bold
            >
              Login here
            </Link>
          </figure>
          {
            <article className="mt-4 ">
              You have registered successfully, you will be redirected
            </article>
          }
        </article>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
