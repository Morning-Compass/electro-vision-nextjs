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
          <div className="flex flex-row items-center justify-center gap-4">
            <Image
              src="/images-landing-page/Lightning.png"
              alt="Lighting Image"
              width={48}
              height={48}
            />
            <div className="text-2xl">Electro Vision</div>
          </div>
        </NavbarElement>
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
