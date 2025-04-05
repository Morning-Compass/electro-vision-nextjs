"use client";

import { useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";

export default function Chat() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row w-full">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock />
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
