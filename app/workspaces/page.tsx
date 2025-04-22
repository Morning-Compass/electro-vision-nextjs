"use client";

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
  function on() {
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.style.display = "block";
    }
  }

  return (
    <PageTemplate>
      <NavbarTemplate />
      <Overlay>
        <p className="text-4xl mb-10">Add Workspace</p>
        <textarea
          name="textarea"
          className="w-96 h-96 rounded-xl mb-10 bg-ev-gray text-ev-dark-gray text-wrap"
        />
        <section className="flex flex-col justify-center items-center gap-6 w-full">
          <section className="flex flex-row justify-between items-center w-full">
            <p className="text-xl">Select Plan:</p>
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
      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="w-full flex flex-row items-center justify-between align-middle gap-4 mt-2">
            <h2 className="text-3xl font-semibold p-0 m-0 leading-none w-1/2 ml-6">
              Workspaces
            </h2>
            <section className="flex flex-row justify-around w-[90%]">
              <SearchButton />
              <Input
                name="add"
                type="button"
                className="text-white border-4 bg-ev-green border-none rounded-[0.9rem] max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Add"
                onClick={() => {on()}}
              />
              <Input
                name="remove"
                type="button"
                className="text-white border-4 bg-ev-red border-none rounded-[0.9rem] max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 hover:scale-110 duration-300"
                value="Remove"
              />
            </section>
          </section>
          <section className="flex flex-auto flex-wrap justify-between">
            <section className="h-auto flex flex-col items-center justify-center p-6  gap-5">
              <Link href={{
                pathname: "workspaces/plans",
              }}>
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link href={{
                pathname: "workspaces/plans",
              }}>
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link href={{
                pathname: "workspaces/plans",
              }}>
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link href={{
                pathname: "workspaces/plans",
              }}>
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link href={{
                pathname: "workspaces/plans",
              }}>
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
            <section className="h-auto flex flex-col items-center justify-center p-6 gap-5">
              <Link href={{
                pathname: "workspaces/plans",
              }}>
                <Image
                  src="/problem.png"
                  alt="problem"
                  width={0}
                  height={0}
                  className="w-[30rem] h-auto"
                />
              </Link>
              <p className="text-xl">Hangar 1</p>
            </section>
          </section>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
