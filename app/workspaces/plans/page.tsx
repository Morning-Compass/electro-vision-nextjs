"use client";

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

export default function EmployeesOverview() {
  function onAdd() {
    const overlay = document.getElementById("overlayAdd");
    if (overlay) {
      overlay.style.display = "block";
    }
  }

  function onSettings() {
    const overlay = document.getElementById("overlaySettings");
    if (overlay) {
      overlay.style.display = "block";
    }
  }

  return (
    <PageTemplate>
      <NavbarTemplate />
      <Overlay id="overlayAdd">
        <p className="text-4xl mb-10">Add Worker</p>
        <section className="flex flex-col justify-center items-center gap-6 w-full">
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Role:</p>
            <Input
              name="name_text"
              type="text"
              className="text-ev-dark-gray border-4 bg-ev-gray border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-3"
              placeholder="Electrician..."
            />
          </section>
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Invite link:</p>
            <Input
              name="copy"
              type="button"
              className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
              value="Copy"
            />
          </section>
        </section>
      </Overlay>
      <Overlay id="overlaySettings">
        <p className="text-4xl mb-10">Change Data</p>
        <section className="flex flex-col justify-center items-center gap-6 w-full">
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Name:</p>
            <Input
              name="name_text"
              type="text"
              className="text-ev-dark-gray border-4 bg-ev-gray border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-3"
              placeholder="Electrician..."
            />
          </section>
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Start Date:</p>
            <Input
              name="start_text"
              type="text"
              className="text-ev-dark-gray border-4 bg-ev-gray border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-3"
              placeholder="29/01/2025"
            />
          </section>
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Due Date:</p>
            <Input
              name="due_text"
              type="text"
              className="text-ev-dark-gray border-4 bg-ev-gray border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-3"
              placeholder="25/08/2027"
            />
          </section>
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Plan file:</p>
            <Input
              name="select"
              type="button"
              className="text-white border-4 bg-mc-blue border-none rounded-lg max-w-[11rem] min-w-20 w-[8vw] max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
              value="Select"
            />
          </section>
        </section>
      </Overlay>
      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="flex flex-row w-full">
            <section className="flex flex-col items-center w-3/4 h-auto">
              <Image
                src="/problem.png"
                alt="problem"
                width={0}
                height={0}
                className="rounded-3xl w-3/4 h-auto mb-6"
              />
              <section className="flex flex-row items-center justify-around w-full">
                <Input
                  name="settings"
                  type="button"
                  className="text-white border-4 bg-mc-blue border-none rounded-lg w-96 max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Settings"
                  onClick={() => {onSettings()}}
                />
                <Link href={{
                  pathname: 'plans/editor',
                }}>
                  <Input
                    name="add_tasks"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-96 max-h-12 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Add Tasks"
                  />
                </Link>
              </section>
            </section>
            <section className="flex flex-col w-1/4">
              <section className="w-full flex flex-row items-center mb-10 border-b-4 pb-5">
                <p className="text-3xl mr-4">Workers</p>
                <SearchButton/>
              </section>
              <section className="flex flex-col w-full gap-4 mb-10">
                <section className="flex flex-row justify-between items-center pl-4 pr-4">
                  <Image
                    src="/employee.png"
                    alt="Employee"
                    width={0}
                    height={0}
                    className="rounded-full w-14 h-auto"
                  />
                  <p className="text-2xl">Ahmed Rash</p>
                  <Input
                    name="details"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-24 max-h-6 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Details"
                  />
                </section>
                <section className="flex flex-row justify-between items-center pl-4 pr-4">
                  <Image
                    src="/employee.png"
                    alt="Employee"
                    width={0}
                    height={0}
                    className="rounded-full w-14 h-auto"
                  />
                  <p className="text-2xl">Ahmed Rash</p>
                  <Input
                    name="details"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-24 max-h-6 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Details"
                  />
                </section>
                <section className="flex flex-row justify-between items-center pl-4 pr-4">
                  <Image
                    src="/employee.png"
                    alt="Employee"
                    width={0}
                    height={0}
                    className="rounded-full w-14 h-auto"
                  />
                  <p className="text-2xl">Ahmed Rash</p>
                  <Input
                    name="details"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-24 max-h-6 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Details"
                  />
                </section>
                <section className="flex flex-row justify-between items-center pl-4 pr-4">
                  <Image
                    src="/employee.png"
                    alt="Employee"
                    width={0}
                    height={0}
                    className="rounded-full w-14 h-auto"
                  />
                  <p className="text-2xl">Ahmed Rash</p>
                  <Input
                    name="details"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-24 max-h-6 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Details"
                  />
                </section>
                <section className="flex flex-row justify-between items-center pl-4 pr-4">
                  <Image
                    src="/employee.png"
                    alt="Employee"
                    width={0}
                    height={0}
                    className="rounded-full w-14 h-auto"
                  />
                  <p className="text-2xl">Ahmed Rash</p>
                  <Input
                    name="details"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-24 max-h-6 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Details"
                  />
                </section>
                <section className="flex flex-row justify-between items-center pl-4 pr-4">
                  <Image
                    src="/employee.png"
                    alt="Employee"
                    width={0}
                    height={0}
                    className="rounded-full w-14 h-auto"
                  />
                  <p className="text-2xl">Ahmed Rash</p>
                  <Input
                    name="details"
                    type="button"
                    className="text-white border-4 bg-mc-blue border-none rounded-lg w-24 max-h-6 min-h-4 h-[3vh] pl-4 pr-4 hover:scale-110 duration-300"
                    value="Details"
                  />
                </section>
              </section>
              <section className="w-full flex flex-row items-center justify-around mb-10">
                <Input
                  name="add"
                  type="button"
                  className="text-white border-4 bg-ev-green border-none rounded-[0.9rem] max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Add"
                  onClick={() => {onAdd()}}
                />
                <Input
                  name="remove"
                  type="button"
                  className="text-white border-4 bg-ev-red border-none rounded-[0.9rem] max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                  value="Remove"
                />
              </section>
              <p className="text-3xl mb-4">Start Date: 20 May 2025</p>
              <p className="text-3xl">Due Date: 21 June 2026</p>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
