"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import Link from "next/link";
import Image from "next/image";

export default function EmployeesOverview() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="alert" />
        <ContentBlock>
          <section className="w-full flex flex-row items-center justify-between align-middle gap-4 mt-2">
            <h2 className="text-3xl font-semibold p-0 m-0 leading-none w-1/2 ml-6">
              Employees problems by workspace
            </h2>
            <section className="flex flex-row justify-around w-[90%]">
              <SearchButton />
            </section>
          </section>
          <section className="flex flex-auto flex-wrap justify-between">
            <section className="h-auto flex flex-col items-center justify-center p-6  gap-5">
              <Link
                href={{
                  pathname: "../employees-problems/problems",
                }}
              >
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link
                href={{
                  pathname: "../employees-problems/problems",
                }}
              >
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link
                href={{
                  pathname: "../employees-problems/problems",
                }}
              >
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link
                href={{
                  pathname: "../employees-problems/problems",
                }}
              >
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link
                href={{
                  pathname: "../employees-problems/problems",
                }}
              >
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link
                href={{
                  pathname: "../employees-problems/problems",
                }}
              >
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
