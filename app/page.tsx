// page.tsx
"use client";

import { FooterSmall } from "@/components/templates/FooterSmall";
import Link from "next/link";
import Image from "next/image";
// import EmblaCarousel from "@/components/carousel/EmblaCarousel";
import PageTemplate from "@/components/templates/PageTemplate";
// import { EmblaOptionsType } from "embla-carousel";
import useUserContext from "@/ev-contexts/userContextProvider";

export default function Home() {
  const { User, UserDispatch } = useUserContext();

  const CarouselImages = [
    {
      id: "ElectricPlanAssign",
      type: "custom",
      title: "Custom Electric Plan",
      imageUrl: "/images-landing-page/ElectricPlanAssign.png",
      altText: "Electric Plan Assign",
      description: `You can micro-manage all your employees by assigning them to specific places on our custom plan editor.`,
    },
    {
      id: "ElectricPlanEmployee",
      type: "custom",
      title: "Custom Electric Plan",
      imageUrl: "/images-landing-page/ElectricPlanEmployee.png",
      altText: "Electric Plan Employee",
      description: `You can view all your employees’ work and see what they are assigned to, thanks to our custom plan editor.`,
    },
    {
      id: "ElectricPlans",
      type: "custom",
      title: "Custom Electric Plan",
      imageUrl: "/images-landing-page/ElectricPlans.png",
      altText: "Electric Plans",
      description: `You can have multiple electrical plans and use them as filters to find where attention is most needed.`,
    },
    {
      id: "Dashboard",
      type: "custom",
      title: "Manage Statistics",
      imageUrl: "/images-landing-page/Dashboard.png",
      altText: "Dashboard",
      description: `You can track all your employee statistics and how much work has been done on-site, thanks to our dashboard that shows all the important information.`,
    },
    {
      id: "Calendar",
      type: "custom",
      title: "Manage Time",
      imageUrl: "/images-landing-page/Calendar.png",
      altText: "Calendar",
      description: `You can set when and what has to be done by using the built-in calendar. It’s easy to see what will be done in a week.`,
    },
    {
      id: "DashboardEmployees",
      type: "custom",
      title: "Manage Employees",
      imageUrl: "/images-landing-page/AttendanceOverview.png",
      altText: "Employees",
      description: `You can overview all your employees, see what they are working on, and who they are—thanks to our Employees Overview screen.`,
    },
  ];

  const OPTIONS: EmblaOptionsType = { loop: true };

  return (
    <body className="bg-ev-main-bg">
      <PageTemplate bgClass="#F1F2F6" allowUnauthenticated={true}>
        {/* Nav buttons */}
        <div className="flex flex-row top-12 right-16 z-10 absolute max-sm:right-10">
          <div className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-mc-darkwhite text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40 mr-4 sm:mr-8 md:mr-16">
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

        {/* Welcome section */}
        <section className="flex items-center justify-center min-h-[70vh] relative text-center px-4">
          <h1 className="text-ev-darkblue text-5xl sm:text-6xl md:text-7xl lg:text-8xl z-10">
            Welcome to Electro Vision
          </h1>
          <Image
            src="/images-landing-page/Lightning.png"
            alt="Lightning"
            width={768}
            height={768}
            className="absolute z-5 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          />
        </section>

        {/* Carousel section */}
        {/* Changed h-[70vh] to min-h-[70vh] to allow vertical expansion */}
        {/* <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-4/5 min-h-[70vh] mt-10 mb-10 p-4 sm:p-6 md:p-8 lg:p-11 max-sm:w-[95%]">
          <EmblaCarousel slides={CarouselImages} options={OPTIONS} />
        </section> */}

        <FooterSmall />
      </PageTemplate>
    </body>
  );
}
