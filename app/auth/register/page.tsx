"use client";

import { useState } from "react";
import OLF, { ElectroVisionError } from "@/ev-lib/ElectroVisionFetch";
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
import Input from "@/components/Input";
import Image from "next/image";
import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Register() {
  type formProps = {
    username: string | null;
    email: string | null;
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

  //const [response, setResponse] = useState<any>();
  const { User, UserDispatch } = useUserContext();
  const router = useRouter();

  const onSubmit: SubmitHandler<formProps> = async (data) => {
    try {
      const res = await OLF.post(ApiLinks.register, {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // Check if the response contains an error
      if ("error" in res) {
        // Handle the error case
        const error = res.error;
        if (error instanceof ElectroVisionError) {
          toast.error(error.error); // Display the error message from the server
        } else {
          toast.error("An unexpected error occurred");
        }
        return;
      }

      // If no error, proceed with success case
      const response = res.data.response; // Access the data property

      if (response.ok) {
        let user: UserEntityType = {
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
        toast.success("Login Successful!");
        router.push("/");
        router.refresh();
      } else {
        // Handle case where response.ok is false
        toast.error(response.message || "Registration failed");
      }

      console.log(response);
    } catch (error) {
      // This catch block is for unexpected errors (like network issues)
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred during registration");
    }
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row justify-around text-mc-text bg-mc-primary w-[55vw] min-w-72 opacity-95 rounded-[1.5rem] mt-auto mb-auto mc-blur transition-colors duration-500 p-6 max-h-[75vh]">
        <Image
          src="./login_register_image.svg"
          className="flex-1 w-[calc(50%-10em)] h-auto object-contain"
          alt="Register"
          width={10}
          height={10}
        />
        <article className="flex flex-col items-center justify-between h-auto w-[50%] mt-28 mb-12">
          <header className="text-3xl font-bold mb-8 mt-8 mr-2 ml-2 text-center">
            Welcome!
          </header>
          <form
            className="flex flex-col items-stretch justify-between gap-4 h-[60%]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Username</h1>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                error={errors.username?.message}
                register={register("username", {
                  validate: (username) => {
                    const useranmeRegexResult = Regex.username.test(
                      username ?? "",
                    );
                    if (!useranmeRegexResult) {
                      return "Username must be correct";
                    }
                    return true;
                  },
                  required: {
                    value: true,
                    message: "Username is required",
                  },
                })}
              />
            </FormErrorWrap>
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Email</h1>
              <Input
                type="text"
                name="email"
                placeholder="Email"
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                error={errors.email?.message}
                register={register("email", {
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
              />
            </FormErrorWrap>
            <FormErrorWrap>
              <h1 className="font-bold text-lg pl-4">Repeat Password</h1>
              <Input
                type="password"
                name="repPassword"
                placeholder="Repeat Password"
                className="border-4 bg-white text-black border-solid rounded-[0.9rem] max-w-[40rem] min-w-56 w-[25vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
                error={errors.repPassword?.message}
                register={register("repPassword", {
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
              />
            </FormErrorWrap>
            <Button
              type="submit"
              value="Register"
              customWidth="max-w-[40rem] min-w-56 w-[25vw]"
            />
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
        </article>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
