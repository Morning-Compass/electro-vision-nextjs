"use client";

import { useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";

export default function Chat() {
  return (
    <PageTemplate>
      <NavbarTemplate />

      <FooterSmall />
    </PageTemplate>
  );
}
