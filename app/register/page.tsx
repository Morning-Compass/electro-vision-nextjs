"use client";

import { useState } from "react";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Button from "@/components/Button";
import { FooterSmall } from "@/components/templates/FooterSmall";
import { User as UserEntityType } from "@/ev-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import AuthConst from "@/ev-const/authconst";
import FormErrorParahraph from "@/components/templates/FormErrorParagraph";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import Regex from "@/ev-const/regex";

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
      <section className="flex flex-row justify-around text-mc-text bg-mc-primary w-[55vw] min-w-72 opacity-95 rounded-[1.5rem] mt-auto mb-auto mc-blur transition-colors duration-500 p-6 max-h-[75vh]">
        <img
          src="./login_register_image.svg"
          className="flex-1 w-[calc(50%-10em)] h-auto object-contain"
        />
        <article className="flex flex-col items-center justify-between h-auto w-[50%] mt-12 mb-12">
          <header className="text-3xl font-bold mb-8 mt-8 mr-2 ml-2 text-center">
            Welcome!
          </header>
          <form
            className="flex flex-col items-stretch justify-between gap-4 h-[60%]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Email</h1>
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
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.email} />
            </FormErrorWrap>
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Password</h1>
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
                  validate: (password) => {
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
                      !/[!@#$%^&*(),.?":{}|<>[\]\\\/`~'=_+\-]/.test(password)
                    ) {
                      return "Password must contain at least one special character";
                    }
                    return true;
                  },
                })}
                type="password"
                placeholder="Password"
                name="password"
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.password} />
            </FormErrorWrap>
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Repeat Password</h1>
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
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
              />
              <FormErrorParahraph errorObject={errors.repPassword} />
            </FormErrorWrap>
            <Button
              type="submit"
              value="Register"
              customWidth="max-w-[40rem] min-w-56 w-[25vw]"
            />
            {/* <div onClick={() => setShowPassword(p => !p)} className="w-4 h-4 text-center border-solid border-black rounded-[100%] cursor-pointer">x</div> */}
          </form>
          <figure className="flex flex-col items-center justify-center m-6">
            <p className="select-none ml-4 mr-4 text-center">
              Already have account?
            </p>
            <Link
              href={"/login"}
              className="text-mc-text hover:scale-110 duration-300 ml-4 mr-4 font-bold"
            >
              Login here
            </Link>
          </figure>
          {/* <article className="mt-4">
            You have registered successfully, you will be redirected
          </article> */}
        </article>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
