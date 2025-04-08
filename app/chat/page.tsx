"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import CalendarButton from "@/components/CalendarButton";

export default function Chat() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock>
          <section className="w-full flex flex-row items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-[1.75rem] font-bold p-0 m-0 leading-none translate-y-[3px]">
                Messages
              </h2>
            </div>
            <SearchButton />
            <CalendarButton />
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
