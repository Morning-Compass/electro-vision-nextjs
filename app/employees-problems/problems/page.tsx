"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Image from "next/image";

export default function EmployeesOverview() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="alert" />
        <ContentBlock>
          <section className="flex flex-row w-full max-lg:flex-col">
            <Image
              src="/problem.png"
              alt="problem"
              width={0}
              height={0}
              className="rounded-3xl w-3/4 h-auto -ml-6 -mt-6 -mb-6 mr-6 max-lg:w-full max-lg:m-0"
            />
            <section className="flex flex-col w-1/4 max-lg:w-full max-lg:mt-12">
              <section className="w-full flex flex-col items-center mb-10">
                <p className="text-3xl">Hangar 1</p>
              </section>
              <section className="gap-4">
                <p className="text-2xl">Problems: 23</p>
                <p className="text-2xl">Warnings: 10</p>
                <p className="text-2xl">Attendance needed: 33</p>
                <p className="text-2xl">Worker: Ahmed Rashdan</p>
              </section>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
