"use client";

import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import useUserContext from "@/mc-contexts/userContextProvider";
import { useEffect } from "react";

export default function Home() {
  const { User, UserDispatch } = useUserContext();
  useEffect(() => {
    UserDispatch({
      type: "setUsername",
      username: "username",
    });
    UserDispatch({
      type: "setId",
      userId: "aoch-123h-b978y",
    });
  }, []);

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-col items-center mt-auto mb-auto">
        Morning Compass
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
