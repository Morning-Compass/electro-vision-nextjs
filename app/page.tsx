"use client";

import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import useUserContext from "@/mc-contexts/userContextProvider";

export default function Home() {
  const { User } = useUserContext();
  User.setUsername("Tomek");
  User.setUserId("apdw-421n-f0bn-123o");

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
