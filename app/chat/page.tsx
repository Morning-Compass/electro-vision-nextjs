"use client";

import { useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";

export default function Chat() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <SidebarTemplate />
      <FooterSmall />
    </PageTemplate>
  );
}
