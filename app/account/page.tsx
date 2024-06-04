"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import useUserContext from "@/mc-contexts/userContextProvider";
import Image from "next/image";
import { useState } from "react";

const AccountPage = () => {
  const [usernameEditEnabled, setUsernameEditEnabled] = useState(false);

  const { User } = useUserContext();

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
              <form className="flex flex-row items-start justify-center gap-2">
                <Input
                  type="text"
                  name="username"
                  value={User.username}
                  onChange={() => console.log("monk")}
                  disabled={!usernameEditEnabled}
                />
                <div
                  className="max-h-12 min-h-8 h-[10vh] aspect-square grid place-items-center"
                  onClick={() => setUsernameEditEnabled((p) => !p)}
                >
                  <Image src={"/settings.png"} width={32} height={32} alt="E" />
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
