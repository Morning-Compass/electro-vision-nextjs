"use client";

import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import EmblaCarousel from "@/components/carousel/EmblaCarousel";
import { EmblaOptionsType } from "embla-carousel";
import PageTemplate from "@/components/templates/PageTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";

export default function Home() {
  const { User, UserDispatch } = useUserContext();

  return (
    <PageTemplate bgClass="#F1F2F6">
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="hub" />
        <div className=" bg-ev-primary w-full h-full flex items-center rounded-3xl"></div>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
