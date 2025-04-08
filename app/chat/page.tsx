"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import CalendarButton from "@/components/CalendarButton";
import Input from "@/components/Input";

export default function Chat() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock>
          <section className="w-full flex flex-row items-center justify-between gap-4">
            <h2 className="text-[1.75rem] font-semibold p-0 m-0 leading-none">
              Messages
            </h2>
            <section className="flex flex-row justify-around w-[90%]">
              <SearchButton />
              <CalendarButton />
              <Input
                name="add_button"
                type="button"
                className="text-white border-4 bg-mc-blue border-none rounded-[0.9rem] max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="New Message"
              />
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
