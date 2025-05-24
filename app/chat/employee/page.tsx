"use client";

import { useSearchParams } from "next/navigation";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import ContentBlockElement from "@/components/ContentBlockElement";
import Link from "next/link";

export default function ChatEmployee() {
  const searchParams = useSearchParams();

  const id: number = parseInt(searchParams.get("id") ?? "0");
  const employee: string = searchParams.get("employee") ?? "employee";
  const role: string = searchParams.get("role") ?? "role";
  const department: string = searchParams.get("department") ?? "department";
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock>
          <section className="bg-gray-200 w-full p-1 h-auto rounded-[0.9em] flex items-center justify-center ">
            <section
              className={`flex justify-around text-[1.2em] text-[#3354F4] font-semibold w-full max-lg:text-sm`}
            >
              <Link href={"/chat"}>Back</Link>
              <section className="grid gap-8 ml-4 grid-cols-4 max-md:grid-cols-3 max-md:gap-4">
                <p>{id}</p>
                <p>{employee}</p>
                <p>{role}</p>
                <p>{department}</p>
              </section>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
