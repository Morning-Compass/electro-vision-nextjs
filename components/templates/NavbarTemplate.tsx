import React from "react";
import { Navbar, NavbarElement, NavbarMain } from "@/components/navbar";
import NavbarWallet from "../navbar/NavbarWallet";
import Image from "next/image";
import SearchButton from "../SearchButton";

const NavbarTemplate = () => {
  return (
    <Navbar>
      <NavbarMain>
        {/* temporary image*/}
        <NavbarElement link={"/hub"}>
          <div className="flex flex-row items-center justify-center gap-4 max-sm:pl-6 max-[1152px]:gap-0 max-[645px]:mr-3 max-[525px]:mr-0 max-[525px]:pl-2">
            <Image
              src="/images-landing-page/Lightning.png"
              alt="Lighting Image"
              width={48}
              height={48}
            />
            <div className="text-2xl max-[720px]:text-xl max-[400px]:text-sm">Electro Vision</div>
          </div>
        </NavbarElement>
        {/* <NavbarElement link={"/chat"}>Chat</NavbarElement>
        <NavbarElement link={"/workspaces"}>Workspaces</NavbarElement>
        <NavbarElement link={"/employees-problems"}>Problems</NavbarElement>
        <NavbarElement link={"/employees-overview"}>Employees</NavbarElement> */}
        {/*
        <NavbarElement link={"/"}>Home</NavbarElement>
        <NavbarElement link={"/login"}>Login</NavbarElement>
        <NavbarElement link={"/register"}>Register</NavbarElement>
        <NavbarElement link={"/chat"}>Chat</NavbarElement>
        <NavbarElement link={"/calendar"}>Calendar</NavbarElement>
        */}
        <NavbarWallet />
      </NavbarMain>
    </Navbar>
  );
};

export default NavbarTemplate;
