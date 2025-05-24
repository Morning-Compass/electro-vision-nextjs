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
import CustomMenu from "@/components/CustomMenu";
import Link from "next/link";
import React, {useState} from "react";

export default function Chat() {
  const subPage = "chat/employee";
  const linkValue = "Chat";

  const [isCustomMenuOpen, setIsCustomMenuOpen] = useState(false);

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="chat" />
        <ContentBlock>
          <section className="w-full flex flex-row items-center justify-between align-middle gap-4 mt-2">
            <h2 className="text-[1.75rem] font-semibold p-0 m-0 leading-none max-md:text-xl max-[400px]:text-base">
              Messages
            </h2>
            <section className="flex flex-row justify-end items-center gap-8 w-[90%] max-[1350px]:gap-4 max-md:text-sm">
              <SearchButton />
              <div className="flex flex-row justify-end gap-8 w-[30%] max-[1650px]:w-[35%] max-[1350px]:gap-2 max-[1350px]:w-[35%] max-lg:w-[40%] max-[900px]:hidden">
                <CalendarButton />
                <Input
                  name="add_button"
                  type="button"
                  className="text-ev-white border-4 bg-ev-blue border-none rounded-[0.9rem] max-w-[10rem] min-w-32 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="New Message"
                />
              </div>
              <button
                className="hidden max-[900px]:block flex-col items-center justify-center w-8 h-10 space-y-1.5 group"
                onClick={() => setIsCustomMenuOpen(!isCustomMenuOpen)}
              >
                <span className="block w-6 h-1 rounded-full bg-gray-600 group-focus:bg-[#0090cf]"></span>
                <span className="block w-6 h-1 rounded-full bg-gray-600 group-focus:bg-[#0090cf]"></span>
                <span className="block w-6 h-1 rounded-full bg-gray-600 group-focus:bg-[#0090cf]"></span>
              </button>
              <CustomMenu
                isOpen={isCustomMenuOpen}
                onClose={() => setIsCustomMenuOpen(false)}
                sectionClassName="w-[12.5rem]"
              >
                <div className="pb-2">
                  <Input
                    name="add_button"
                    type="button"
                    className="text-ev-white border-4 bg-ev-blue border-none rounded-[0.9rem] max-w-[10rem] min-w-32 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="New Message"
                  />
                </div>
                <CalendarButton />
              </CustomMenu>
            </section>
          </section>
          <section className="mt-8 w-full border-b-4 border-t-3 pt-4 pb-4">
            <section className="grid grid-cols-7 gap-6 w-[75%] max-lg:grid-cols-6 max-[900px]:grid-cols-5 max-md:grid-cols-4 max-[550px]:grid-cols-3 max-[450px]:grid-cols-2">
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
          {/* <ContentBlockElement
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
          /><ContentBlockElement
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
          /><ContentBlockElement
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
          /> */}
          <section className="border-t-2 text-left pt-4">Page 1 of 100</section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
