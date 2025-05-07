"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Input from "@/components/Input";

export default function EmployeesOverview() {
  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="people" />
        <ContentBlock>
          <section className="w-full flex flex-col justify-between align-middle gap-4 mt-2">
            <section className="flex flex-col items-center w-full">
              <p className="font-semibold text-5xl pl-32 pr-32 pb-4 border-b-4">
                Add an Employee
              </p>
            </section>
            <section className="flex flex-col w-1/2 ml-3 gap-5">
              <section className="flex flex-row items-center w-full justify-between">
                <p className="text-2xl">Workspace:</p>
                <Input
                  name="select"
                  type="button"
                  className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[20rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Select"
                />
              </section>
              <section className="flex flex-row items-center w-full justify-between">
                <p className="text-2xl">Role: lightbulb monter</p>
                <Input
                  name="edit"
                  type="button"
                  className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[20rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Edit"
                />
              </section>
              <section className="flex flex-row items-center w-full justify-between">
                <p className="text-2xl">Salary: 2000 PLN/month</p>
                <Input
                  name="edit"
                  type="button"
                  className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[20rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Edit"
                />
              </section>
              <section className="flex flex-row items-center w-full justify-between">
                <p className="text-2xl">
                  Invite link: https://electro-vision/invite
                </p>
                <Input
                  name="edit"
                  type="button"
                  className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[20rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Edit"
                />
              </section>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
