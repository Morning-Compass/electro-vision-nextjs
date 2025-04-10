"use client";

import { useSearchParams } from "next/navigation";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import ChatElement from "@/components/chat/ChatElement";
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
      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock>
          <section className="bg-gray-200 w-full p-1 h-[90%] rounded-[0.9em]">
            <section
              className={`flex justify-around text-[1.2em] text-[#3354F4] font-semibold`}
            >
              <Link href={"/chat"}>back</Link>
              <p>{id}</p>
              <p>{employee}</p>
              <p>{role}</p>
              <p>{department}</p>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
