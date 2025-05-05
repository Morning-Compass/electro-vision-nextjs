"use client";

import { useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";

export default function EmployeesOverview() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  return (
    <PageTemplate>
      <NavbarTemplate />

      <Overlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)}>
        <p className="text-4xl mb-10">Add Workspace</p>
        <textarea
          name="textarea"
          className="w-96 h-96 rounded-xl mb-10 bg-ev-gray text-ev-dark-gray"
        />
        <section className="flex flex-col justify-center items-center gap-6 w-full">
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Select Plan:</p>
            <Input name="file_input" type="file" className="hidden" />
            <label
              htmlFor="file_input"
              className="text-white text-center bg-mc-blue rounded-lg px-4 py-2 hover:scale-110 duration-300"
            >
              Add file
            </label>
          </section>
          <section className="flex flex-row justify-between items-center w-full">
            <label htmlFor="name_text" className="text-xl">
              Name:
            </label>
            <Input
              name="name_text"
              type="text"
              className="text-ev-dark-gray bg-ev-gray rounded-lg px-3 py-2"
              placeholder="Socket..."
            />
          </section>
        </section>
      </Overlay>

      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="flex items-center justify-between mt-2 ml-6 mr-6">
            <h2 className="text-3xl font-semibold">Workspaces</h2>
            <section className="flex items-center gap-4">
              <SearchButton />
              <Input
                name="add"
                type="button"
                className="text-white bg-ev-green rounded-lg px-4 py-2 hover:scale-110 duration-300"
                value="Add"
                onClick={() => setIsOverlayOpen(true)}
              />
              <Input
                name="remove"
                type="button"
                className="text-white bg-ev-red rounded-lg px-4 py-2 hover:scale-110 duration-300"
                value="Remove"
              />
            </section>
          </section>
          <section className="flex flex-wrap justify-between p-6 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <section
                key={idx}
                className="flex flex-col items-center justify-center p-6 gap-5"
              >
                <Link href="/workspaces/plans">
                  <Image
                    src="/problem.png"
                    alt="Workspace"
                    width={480}
                    height={0}
                    className="w-[30rem] h-auto"
                  />
                </Link>
                <p className="text-xl">Hangar {idx + 1}</p>
              </section>
            ))}
          </section>
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
