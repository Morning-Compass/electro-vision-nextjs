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

  return (
    <div className="h-svh w-svw flex flex-col items-center justify-between">
      {/*<PageTemplate bgClass="#F1F2F6" allowUnauthenticated={true}>*/}
      {/* Nav buttons */}
      <div className="flex flex-row top-12 right-16 z-10 absolute max-sm:right-10 w-full items-center justify-end">
        <Link
          href="/auth/login"
          className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-mc-darkwhite text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40 mr-4 sm:mr-8 md:mr-16"
        >
          <strong>Login</strong>
        </Link>
        <Link
          href="/auth/register"
          className="flex justify-center items-center rounded-lg border-2 border-ev-border-blue text-mc-darkwhite text-xl p-3 pl-9 pr-9 bg-ev-blue-fill/40 mr-4 sm:mr-8 md:mr-16"
        >
          <strong>Register</strong>
        </Link>
      </div>
      {/* Welcome section */}
      <section className="flex items-center justify-center min-h-[70vh] text-center px-4">
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
      <FooterSmall />
      {/* </PageTemplate> */}
    </div>
  );
}
