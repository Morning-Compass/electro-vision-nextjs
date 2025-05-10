"use client";

import { useEffect, useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Image from "next/image";
import SearchButton from "@/components/SearchButton";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";
import Link from "next/link";
import { useRouter } from "next/router";
import useUserContext from "@/ev-contexts/userContextProvider";

export default function WorkspaceDetails() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { User } = useUserContext();

  return (
    <PageTemplate>
      <NavbarTemplate />

      <Overlay isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <p className="text-4xl mb-10">Add Worker</p>
        <div className="flex flex-col gap-6 w-full">
          <div className="flex justify-between items-center w-full">
            <p className="text-xl">Role:</p>
            <Input
              name="role_text"
              type="text"
              placeholder="Electrician..."
              className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg"
            />
          </div>
          <div className="flex justify-between items-center w-full">
            <p className="text-xl">Invite link:</p>
            <Input
              name="copy"
              type="button"
              value="Copy"
              className="px-4 py-2 bg-mc-blue text-white rounded-lg hover:scale-110 duration-300"
            />
          </div>
        </div>
      </Overlay>

      <Overlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <p className="text-4xl mb-10">Change Data</p>
        <div className="flex flex-col gap-6 w-full">
          {[
            { label: "Name", placeholder: "Electrician..." },
            { label: "Start Date", placeholder: "29/01/2025" },
            { label: "Due Date", placeholder: "25/08/2027" },
          ].map(({ label, placeholder }) => (
            <div
              key={label}
              className="flex justify-between items-center w-full"
            >
              <p className="text-xl">{label}:</p>
              <Input
                name={label.toLowerCase().replace(" ", "_")}
                type="text"
                placeholder={placeholder}
                className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg"
              />
            </div>
          ))}
          <div className="flex justify-between items-center w-full">
            <p className="text-xl">Plan file:</p>
            <Input
              name="select_file"
              type="button"
              value="Select"
              className="px-4 py-2 bg-mc-blue text-white rounded-lg hover:scale-110 duration-300"
            />
          </div>
        </div>
      </Overlay>

      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          {/* <p>WorkspaceId: {User.currentWorkspace}</p> */}
          <div className="flex w-[90%]">
            <div className="flex flex-col w-3/4 p-6 gap-8">
              <Image
                src="/problem.png"
                alt="problem"
                width={1200}
                height={600}
                className="rounded-3xl w-full h-auto object-cover shadow-lg"
              />

              <div className="flex flex-col gap-2 px-4">
                <p className="text-3xl font-semibold mb-2">Workspace Details</p>
                <p>
                  Start Date: {User.currentWorkspace?.start_date?.toString()}
                </p>
                <p>
                  Due Date:{" "}
                  {User.currentWorkspace?.finish_date?.toString() ||
                    "Not yet established"}
                </p>
                <p>
                  Subscription Tier: {User.currentWorkspace?.ev_subscription}
                </p>
                <p>
                  Geolocation:{" "}
                  {User.currentWorkspace?.geolocation || "Not yet established"}
                </p>
                <p>Filename: {User.currentWorkspace?.plan_file_name}</p>
              </div>

              <div className="flex justify-around mt-6">
                <Input
                  name="settings"
                  type="button"
                  value="Settings"
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-110 duration-300"
                />
                <Link href="./plans/editor">
                  <Input
                    name="add_tasks"
                    type="button"
                    value="Add Tasks"
                    className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-110 duration-300"
                  />
                </Link>
              </div>
            </div>

            <div className="w-1/4 p-6">
              <div className="flex justify-between items-center mb-10 border-b-4 pb-5">
                <p className="text-3xl">Workers</p>
                <SearchButton />
              </div>
              <div className="flex flex-col gap-4 mb-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center gap-4 flex-row"
                  >
                    <Image
                      src="/employee.png"
                      alt="Employee"
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                    <p className="text-2xl">Ahmed Rash</p>
                    <Input
                      name="details"
                      type="button"
                      value="Details"
                      className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-110 duration-300"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-around mb-10">
                <Input
                  name="add"
                  type="button"
                  value="Add"
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 bg-ev-green text-white rounded-lg hover:scale-110 duration-300"
                />
                <Input
                  name="remove"
                  type="button"
                  value="Remove"
                  className="px-4 py-2 bg-ev-red text-white rounded-lg hover:scale-110 duration-300"
                />
              </div>
            </div>
          </div>
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
