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
      value: "tomek",
    });
    UserDispatch({
      type: "setId",
      value: "aoch-123h-b978y",
    });
    UserDispatch({
      type: "setEmail",
      value: "tomek@el-jot.eu",
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
