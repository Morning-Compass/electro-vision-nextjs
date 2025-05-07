import Themes from "@/ev-const/themes";
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
    <Link href={"/account"}>
      <div className="grid place-items-center">
        <div className="flex flex-row items-center justify-center gap-4">
          <p className="text-ev-text">{username}</p>
          <Image
            src={userPropfilePicture ?? "/default-user.png"}
            width={32}
            height={32}
            alt="pfp"
            className="rounded-full aspect-square"
          />
        </div>
      </div>
    </Link>
  );
};

export default NavbarUserInfo;
