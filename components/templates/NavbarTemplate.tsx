import React from "react";
import { Navbar, NavbarElement, NavbarMain } from "@/components/navbar";
import NavbarWallet from "../navbar/NavbarWallet";

const NavbarTemplate = () => {
  return (
    <Navbar>
      <NavbarMain>
        <NavbarElement link={"/"}>Home</NavbarElement>
        <NavbarElement link={"/login"}>Login</NavbarElement>
        <NavbarElement link={"/register"}>Register</NavbarElement>
        <NavbarElement link={"/roles"}>Management</NavbarElement>
        <NavbarWallet />
      </NavbarMain>
    </Navbar>
  );
};

export default NavbarTemplate;
