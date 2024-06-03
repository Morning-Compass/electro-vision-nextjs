"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import OLF from "@/mc-lib/OneLastFetch";
import ApiLinks from "@/mc-const/api-links";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import Input from "@/components/Input";
import Button from "@/components/Button";
import FormError from "@/components/FormError";
import Regex from "@/mc-const/regex";

export default function Login() {
  type formProps = {
    email: string;
    password: string;
    username: string;
  };

  const [formState, setFormState] = useState<formProps>({
    email: "",
    password: "",
    username: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [repPassword, setRepPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordVerificationError, setPasswordVerificationErorr] = useState<
    string[] | null
  >(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const passwordVerificationErrorList: string[] = [];
    e.preventDefault();

    if (!Regex.emailRegistration.match(formState.email)) {
      passwordVerificationErrorList.push("Email must be correct");
    }
    if (formState.password !== repPassword) {
      console.log("passwords must match");
      passwordVerificationErrorList.push("Passwords must match");
    }
    if (formState.password.length < 8 && !passwordVerificationError) {
      console.log("password must be atleast 8 character long");
      passwordVerificationErrorList.push(
        "Password must be at least 8 characters long",
      );
    }
    if (!Regex.passwordRegistration.match(formState.password.toLowerCase())) {
      console.log("password must contain any special char");
      passwordVerificationErrorList.push(
        "Password must contain any special character",
      );
    }

    if (passwordVerificationErrorList.length > 0) {
      setPasswordVerificationErorr(passwordVerificationErrorList);
    } else {
      setPasswordVerificationErorr(null);
    }

    try {
      const response = await OLF.post(ApiLinks.register, {
        username: formState.username,
        email: formState.email,
        password: formState.password,
      });

      setMessage(response["message"]);
      console.log(response["message"]);
    } catch (e) {}
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  // const inputStyles = { inputSecurity: showPassword ? "none" : "inherit", }

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-col items-center justify-center text-mc-text bg-mc-primary w-[40vw] opacity-95 rounded-[3rem] mt-auto mb-auto">
        <article className="flex flex-col items-center justify-center mt-12 mb-12">
          <header className="text-3xl font-bold mb-8 mt-8 mr-2 ml-2">
            Create Morning Compass account
          </header>
          <form
            className="flex flex-col items-center justify-center gap-4"
            onSubmit={handleSubmit}
          >
            <Input
              type="text"
              placeholder="Email"
              name="email"
              value={formState.email}
              onChange={handleChange}
            />
            <Input
              type="text"
              placeholder="Username"
              name="username"
              value={formState.username}
              onChange={handleChange}
            />
            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={formState.password}
              onChange={handleChange}
            />
            <Input
              type="password"
              placeholder="Repeat Password"
              name="password"
              value={repPassword}
              onChange={(e) => setRepPassword(e.target.value)}
            />
            <FormError condition={passwordVerificationError !== null}>
              {passwordVerificationError?.map((passwordError) => (
                <p>{passwordError}</p>
              ))}
            </FormError>
            <Button type="submit" value="Register" />
            {/* <div onClick={() => setShowPassword(p => !p)} className="w-4 h-4 text-center border-solid border-black rounded-[100%] cursor-pointer">x</div> */}
          </form>
          <figure className="flex items-center justify-center p-6">
            <p className="flex flex-row items-center justify-center gap-6 select-none">
              Already have account?{" "}
              <Link
                href={"/login"}
                className="text-mc-text font-medium hover:scale-110 duration-300"
                font-bold
              >
                <p className="mr-4 ml-4">Login here</p>
              </Link>
            </p>
          </figure>
          {message ? (
            <article className="mt-4 ">
              You have registered successfully, you will be redirected
            </article>
          ) : null}
        </article>
      </section>
    </PageTemplate>
  );
}
