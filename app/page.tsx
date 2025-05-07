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

export default function Home() {
  const { User, UserDispatch } = useUserContext();
  const CarouselImages = [
    {
      id: "ElectricPlanAssign",
      type: "custom",
      title: "Custom Electric Plan",
      imageUrl: "/images-landing-page/ElectricPlanAssign.png",
      altText: "Electric Plan Assign",
      description:
        "You can micro manage all your employees by assigning\n" +
        "            them to specific places on our custom plan editor.\n",
    },
    {
      id: "ElectricPlanEmployee",
      type: "custom",
      title: "Custom Electric Plan",
      imageUrl: "/images-landing-page/ElectricPlanEmployee.png",
      altText: "Electric Plan Employee",
      description:
        "You can view all your employees work and see what\n" +
        "            they are assigned thanks to our custom plan editor.\n",
    },
    {
      id: "ElectricPlans",
      type: "custom",
      title: "Custom Electric Plan",
      imageUrl: "/images-landing-page/ElectricPlans.png",
      altText: "Electric Plans",
      description:
        "You can have multiple electrical plans and\n" +
        "            use them as filters to find where attention is most needed.\n",
    },
    {
      id: "Dashboard",
      type: "custom",
      title: "Manage Statistics",
      imageUrl: "/images-landing-page/Dashboard.png",
      altText: "Dashboard",
      description:
        "You can track all your statistics about employees and how much of\n" +
        "            work on site has been done thanks to our Dashboard that shows all of\n" +
        "            the important information's.",
    },
    {
      id: "Calendar",
      type: "custom",
      title: "Manage Time",
      imageUrl: "/images-landing-page/Calendar.png",
      altText: "Calendar",
      description:
        "You can set when and what has to be done by using in built calendar.\n" +
        "            Thanks to this it is clear to see what will be done in a week.",
    },
    {
      id: "Dashboard",
      type: "custom",
      title: "Manage Employees",
      imageUrl: "/images-landing-page/AttendanceOverview.png",
      altText: "Employees",
      description:
        "You can overview all you employees where you can see details about\n" +
        "            what they are working on and who exactly they are thanks to our\n" +
        "            Employees Overview screen.",
    },
  ];

  const OPTIONS: EmblaOptionsType = { loop: true };

  return (
    <PageTemplate bgClass="#F1F2F6">
      {/*<NavbarTemplate />*/}
      <div className="flex flex-row top-12 right-16 z-10 absolute">
        <div className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-mc-darkwhite text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40 mr-16">
          <Link href="/auth/login">
            <strong>Login</strong>
          </Link>
        </div>
        <div className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-mc-darkwhite text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40">
          <Link href="/auth/register">
            <strong>Register</strong>
          </Link>
        </div>
      </div>
      <section className="flex items-center justify-center w-screen h-screen -mb-24">
        <a className="text-ev-darkblue z-10 text-9xl text-center">
          Welcome to Electro Vision
        </a>
        <Image
          src="/images-landing-page/Lightning.png"
          alt="Lighting Image"
          width={0}
          height={0}
          style={{
            width: "auto",
            height: "auto",
            position: "absolute",
            zIndex: "5",
          }}
        />
      </section>
      <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-4/5 h-[70vh] mt-10 mb-10 p-11">
        <EmblaCarousel slides={CarouselImages} options={OPTIONS} />
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
