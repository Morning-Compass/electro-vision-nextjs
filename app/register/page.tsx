"use client";

import { useState } from "react";
import OLF from "@/mc-lib/OneLastFetch";
import ApiLinks from "@/mc-const/api-links";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FormError from "@/components/FormError";
import { FooterSmall } from "@/components/templates/FooterSmall";
import { User as UserEntityType } from "@/mc-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import AuthConst from "@/mc-const/authconst";

export default function Login() {
  type formProps = Pick<UserEntityType, "email" | "username"> & {
    password: string | null;
    repPassword: string | null;
  };
  const [formState, setFormState] = useState<formProps>({
    email: null,
    password: null,
    username: null,
    repPassword: null,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [repPassword, setRepPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordVerificationError, setPasswordVerificationErorr] = useState<
    string[] | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
            <input
              {...register("email", {
                minLength: {
                  value: AuthConst.minUsernameLength,
                  message: `Username must have at least ${AuthConst.minUsernameLength} characters`,
                },
              })}
              type="text"
              placeholder="Email"
              name="email"
            />
            <input
              {...register("username")}
              type="text"
              placeholder="Username"
              name="username"
            />
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              name="password"
            />
            <input
              {...register("repPassword")}
              type="password"
              placeholder="Repeat Password"
              name="password"
            />
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
          {message ? (
            <article className="mt-4 ">
              You have registered successfully, you will be redirected
            </article>
          ) : null}
        </article>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
