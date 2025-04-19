"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import CalendarButton from "@/components/CalendarButton";
import Input from "@/components/Input";
import ContentBlockElement from "@/components/ContentBlockElement";

export default function Chat() {
  const subPage = "chat/employee";
  const linkValue = "Chat";

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock>
          <section className="w-full flex flex-row items-center justify-between align-middle gap-4 mt-2">
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
          <section className="mt-8 w-full border-b-4 border-t-3 pt-4 pb-4">
            <section className="grid grid-cols-7 gap-6 w-[75%]">
              <section className="font-semibold">ID</section>
              <section className="font-semibold">Employee</section>
              <section className="font-semibold">Role</section>
              <section className="font-semibold">Department</section>
            </section>
          </section>
          <ContentBlockElement
            id={2341421}
            employee="Ahmed Rashdan"
            role="Help Desk Executive"
            department="IT Department"
            link={subPage}
            linkValue={linkValue}
          />
          <ContentBlockElement
            id={2341421}
            employee="Ahmed Rashdan"
            role="Help Desk Executive"
            department="IT Department"
            link={subPage}
            linkValue={linkValue}
          />
          <ContentBlockElement
            id={2341421}
            employee="Ahmed Rashdan"
            role="Help Desk Executive"
            department="IT Department"
            link={subPage}
            linkValue={linkValue}
          />
          <ContentBlockElement
            id={2341421}
            employee="Ahmed Rashdan"
            role="Help Desk Executive"
            department="IT Department"
            link={subPage}
            linkValue={linkValue}
          />
          <section className="border-t-2 text-left pt-4">
            Page 1 of 100
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
