import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Stats } from "fs";

export type SidebarElementprops = {
  link?: string;
  imageSrc: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  containerClassName?: string; // for li element
  linkClassName?: string; // for Link element
  imageClassName?: string;
} & React.HTMLAttributes<HTMLLIElement>;

export default function SidebarElement({
  link,
  imageSrc,
  imageAlt = "Sidebar Icon",
  imageWidth = "32px",
  imageHeight = "32px",
  containerClassName = "",
  linkClassName = "",
  imageClassName = "",
  ...props
}: SidebarElementprops) {
  return (
    <li
      className={`sm:mr-10 flex-grow-1 flex justify-center ${containerClassName}`}
      {...props}
    >
      <Link
        className={`hover:scale-110 duration-200 pt-4 pb-4 ${linkClassName}`}
        href={link ?? ""}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className={`object-contain ${imageClassName}`}
        />
      </Link>
    </li>
  );
}
