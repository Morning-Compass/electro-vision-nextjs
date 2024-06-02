"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import OLF from "@/mc-lib/OneLastFetch";
import ApiLinks from "@/mc-const/api-links";
import { Navbar } from "@/components/navbar";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function Login() {
  type formProps = {
    credential: string;
    password: string;
  };

  const loginOptions = {
    email: "email",
    username: "username",
  } as const;

  const [formState, setFormState] = useState<formProps>({
    credential: "",
    password: "",
  });

  const [loginOption, setLoginOption] = useState<string>(loginOptions.email);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(loginOption);

    const loginLink =
      loginOption === loginOptions.email
        ? ApiLinks.loginEmail
        : ApiLinks.loginUsername;

    const response = await OLF.post(loginLink, {
      [loginOption === loginOptions.email
        ? loginOptions.email
        : loginOptions.username]: formState.credential,
      password: formState.password,
    });
    redirect("/");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

    if (e.target.value.toString().includes("@"))
      setLoginOption(loginOptions.email);
    else setLoginOption(loginOptions.username);
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="text-mc-text bg-mc-primary w-[40vw] opacity-95 rounded-[3rem] mt-auto mb-auto">
        <article className="flex flex-col items-center justify-center mt-12 mb-12">
          <header className="text-3xl font-bold mt-8 mb-8">
            Login to your Morning Compass account
          </header>
          <form
            className="flex flex-col items-center justify-center gap-4"
            onSubmit={handleSubmit}
          >
            {/* temporary check for username or email to be checkt by @ conent or sth */}
            <Input
              type="text"
              placeholder="Email or Username"
              name="credential"
              value={formState.credential}
              onChange={handleChange}
            />
            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={formState.password}
              onChange={handleChange}
            />
            <Button type="submit" value="Login" />
          </form>
          <figure className="flex items-center justify-center p-6">
            <p className="flex flex-row items-center justify-center gap-6 select-none">
              Don't have account?{" "}
              <Link
                href={"/register"}
                className="text-mc-text font-medium hover:scale-110 duration-300"
                font-bold
              >
                <p className="mr-4 ml-4 text-center">Register here</p>
              </Link>
            </p>
          </figure>
        </article>
      </section>
    </PageTemplate>
  );
}
