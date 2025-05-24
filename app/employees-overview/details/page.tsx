"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Input from "@/components/Input";

export default function EmployeesOverview() {
  const searchParams = useSearchParams();

  const id: number = parseInt(searchParams.get("id") ?? "0");
  const employee: string = searchParams.get("employee") ?? "employee";
  const role: string = searchParams.get("role") ?? "role";
  const department: string = searchParams.get("department") ?? "department";
  const profilePicture: string =
    searchParams.get("profilePicture") ?? "profilePicture";

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[80%]">
        <SidebarTemplate activeIcon="people" />
        <section className="flex flex-1 flex-wrap justify-center h-[80vh] overflow-y-scroll">
          <section className="h-auto flex flex-col items-center justify-center p-6 bg-ev-primary-bg rounded-3xl mr-10 mb-10">
            <p className="text-3xl font-semibold max-[1100px]:text-2xl">{employee}</p>
            <Image
              src={profilePicture}
              alt="Employee profile picture"
              width={0}
              height={0}
              className="rounded-3xl w-80 h-auto"
            />
          </section>
          <section className="h-auto flex flex-col justify-evenly p-6 bg-ev-primary-bg rounded-3xl mr-10 mb-10">
            <p className="text-2xl font-semibold max-[1100px]:text-xl">Personal Information</p>
            <p className="text-lg max-[1100px]:text-base">Birth date: 15 Jan 1990</p>
            <p className="text-lg max-[1100px]:text-base">Country: Saudi Arabia</p>
            <p className="text-lg max-[1100px]:text-base">Education: Secondary</p>
            <p className="text-lg max-[1100px]:text-base">Phone number: +966 011 999 3343</p>
            <p className="text-lg max-[1100px]:text-base">Email: ahmed.rashdan@mail.com</p>
          </section>
          <section className="h-auto flex flex-col justify-evenly p-6 bg-ev-primary-bg rounded-3xl mr-10 mb-10">
            <p className="text-2xl font-semibold max-[1100px]:text-xl">Company Information</p>
            <p className="text-lg max-[1100px]:text-base">Working since: 1 Jan 2015</p>
            <p className="text-lg max-[1100px]:text-base">Position: Electrician</p>
            <p className="text-lg max-[1100px]:text-base">Worker ID: {id}</p>
            <p className="text-lg max-[1100px]:text-base">Hours per week: 40</p>
            <p className="text-lg max-[1100px]:text-base">Sex: Male</p>
          </section>
          <section className="h-auto flex flex-col justify-evenly p-6 bg-ev-primary-bg rounded-3xl mr-10 mb-10">
            <p className="text-2xl font-semibold max-[1100px]:text-xl">Billing Information</p>
            <p className="text-lg max-[1100px]:text-base">
              Account number: PL 17 2490 1233 5678 9091 2272 9396
            </p>
            <p className="text-lg max-[1100px]:text-base">Salary per year: $30 000</p>
            <p className="text-lg max-[1100px]:text-base">Salary per hour: $35</p>
            <p className="text-lg max-[1100px]:text-base">Insurance number: 85051212345</p>
          </section>
        </section>
      </section>
      <Input
        name={"edit"}
        type="button"
        className="text-white bg-ev-blue rounded-lg w-[75vw] h-14 pl-4 pr-4 hover:scale-110 duration-300"
        value="Edit"
      />
      <FooterSmall />
    </PageTemplate>
  );
}
