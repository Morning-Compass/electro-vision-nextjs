"use client";

import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useEffect } from "react";
import Image from "next/image";
import BackgroundImage from "./images-landing-page/ThunderstormBackground.png";
import Lighting from "./images-landing-page/Lightning.png";
import ImageCarousel from "@/components/carousel/EmblaCarousel";
import EmployeesOverview from "./images-landing-page/EmployeesOverview.png";
import Dashboard from "./images-landing-page/Dashboard.png";
import Calendar from "./images-landing-page/Calendar.png";
import Link from "next/link";
import EmblaCarousel from "@/components/carousel/EmblaCarousel";
import {EmblaOptionsType} from "embla-carousel";

export default function Home() {
  const { User, UserDispatch } = useUserContext();
  const CarouselImages = [
      "/images-landing-page/Dashboard.png",
      "/images-landing-page/Calendar.png",
      "/images-landing-page/AttendanceOverview.png",
  ];
  const OPTIONS: EmblaOptionsType = { loop: true }
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
    <PageTemplate bgClass="#F1F2F6">
      <NavbarTemplate />
        <div className="flex flex-row top-24 right-20 z-10 absolute">
            <div className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-white text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40 mr-16">
                <Link href="/login"><strong>Login</strong></Link>
            </div>
            <div className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-white text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40">
                <Link href="/register"><strong>Register</strong></Link>
            </div>
        </div>
      <section className="flex items-center justify-center w-screen h-screen mb-10">
        <a className="text-ev-darkblue z-10 text-9xl">Welcome to Electro Vision</a>
        <Image src={Lighting} alt="Lighting Image" style={{position: "absolute", zIndex: "5"}} />
        <Image src={BackgroundImage} alt="Thunderstorm Image" style={{ width: "100%", height: "100%", position: "absolute" }} />
      </section>
      <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-1/2 mt-10 mb-10 p-11">
        <a className="text-black text-8xl">Manage <strong>Everything</strong></a>
          <EmblaCarousel slides={CarouselImages} options={OPTIONS} altText="Images of site" />
      </section>
        <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-7/10 mt-10 mb-10 ml-128 p-11">
            <a className="text-black text-8xl">Manage <strong>Employees</strong></a>
            <div className="flex flex-row justify-start items-center mt-8">
                <a className="text-wrap size-1/3 mr-5 ml-20 text-left">You can overview all you employees where you can see details about what they are working on and who exactly they are thanks to our Employees Overview screen.</a>
                <Image src={EmployeesOverview} alt={"Employees Overview Image"} className="rounded-3xl"></Image>
            </div>
        </section>
        <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-7/10 mt-10 mb-10 mr-128 p-11">
            <a className="text-black text-8xl">Manage <strong>Statistics</strong></a>
            <div className="flex flex-row justify-end items-center mt-8">
                <Image src={Dashboard} alt={"Dashboard Image"} className="rounded-3xl"></Image>
                <a className="text-wrap size-1/3 mr-20 ml-5 text-right">You can track all your statistics about employees and how much of work on site has been done thanks to our Dashboard that shows all of the important information's.</a>
            </div>
        </section>
        <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-7/10 mt-10 mb-10 ml-128 p-11">
            <a className="text-black text-8xl">Manage <strong>Time</strong></a>
            <div className="flex flex-row justify-start items-center mt-8">
                <a className="text-wrap size-1/3 mr-5 ml-20 text-left">You can set when and what has to be done by using in built calendar. Thanks to this it is clear to see what will be done in a week.</a>
                <Image src={Calendar} alt={"Calendar Image"} className="rounded-3xl"></Image>
            </div>
        </section>
      <FooterSmall />
    </PageTemplate>
  );
}
