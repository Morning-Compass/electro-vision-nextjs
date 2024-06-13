import Themes from "@/mc-const/themes";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";

type NavbarUserInfoProps = {
  //  children: ReactNode;
  username: string;
  userPropfilePicture?: string;
};

const NavbarUserInfo = ({
  //  children,
  username,
  userPropfilePicture = undefined,
}: NavbarUserInfoProps) => {
  return (
    <div className="grid place-items-center">
      <div className="flex flex-row items-center justify-center gap-4">
        <p className="text-mc-primary">{username}</p>
        <Image
          src={userPropfilePicture ?? "/default-user.png"}
          width={32}
          height={32}
          alt="pfp"
          className="rounded-full aspect-square"
        />
        <Link href={"/account"}>
          <div className="grid place-items-center rounded-[100%]">
            <Image src={"/cogwheel.png"} alt="account" width={32} height={32} />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NavbarUserInfo;
