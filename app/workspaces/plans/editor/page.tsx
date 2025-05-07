"use client";

import { useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import Image from "next/image";
import SearchButton from "@/components/SearchButton";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";

export default function EmployeesOverview() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  function handleAdd() {
    setIsOverlayOpen(true);
  }

  function handleClose() {
    setIsOverlayOpen(false);
  }

  return (
    <PageTemplate>
      <NavbarTemplate />
      <Overlay
        isOpen={isOverlayOpen}
        onClose={handleClose}
        blockClassName="max-w-lg"
      >
        <p className="text-4xl mb-10">Add Custom Task</p>
        <section className="flex flex-col justify-center items-center gap-6 w-full">
          <textarea
            name="textarea"
            className="w-96 h-96 rounded-xl mb-10 bg-ev-gray text-ev-dark-gray text-wrap"
          />
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Select photo:</p>
            <Input
              name="select"
              type="button"
              className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
              value="Select"
            />
          </section>
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Name:</p>
            <Input
              name="name_text"
              type="text"
              className="text-ev-dark-gray border-4 bg-ev-gray border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-3"
              placeholder="Socket..."
            />
          </section>
        </section>
      </Overlay>

      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <section className="flex flex-row w-full justify-center h-auto">
          <section className="flex flex-col gap-6 h-full bg-white mr-20 p-4 rounded-xl">
            <Image
              src="/outlet.png"
              alt="outlet"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </section>

          <section className="flex flex-col h-full">
            <section className="flex flex-row justify-between items-center w-full bg-white p-4 rounded-xl gap-3 mb-6">
              <Input
                name="add_task"
                type="button"
                className="text-white border-4 bg-ev-green border-none rounded-lg max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Add Task"
                onClick={handleAdd}
              />
              <Input
                name="remove_task"
                type="button"
                className="text-white border-4 bg-ev-red border-none rounded-lg max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Remove Task"
              />
              <Input
                name="change_plan"
                type="button"
                className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Change Plan"
              />
              <Input
                name="add_worker"
                type="button"
                className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Add Worker"
              />
              <Input
                name="assign_work"
                type="button"
                className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Assign Work"
              />
              <SearchButton />
            </section>
            <Image
              src="/problem.png"
              alt="problem"
              width={0}
              height={0}
              className="w-full h-auto rounded-3xl"
            />
          </section>

          <section className="flex flex-col gap-6 h-full bg-white ml-20 p-4 rounded-xl">
            <Image
              src="/outlet.png"
              alt="Outlet"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </section>
        </section>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
