import Input from "@/components/Input";
import Link from "next/link";
import Image from "next/image";

export type ContentBlockElementProps = {
  containerClassName?: string;
  boxClassName?: string;
  id: number;
  employee: string;
  role: string;
  department: string;
  date?: string;
  status?: string;
  profilePicture?: string;
  link: string;
  linkValue: string;
};

function statusClass(status?: string) {
  switch (status) {
    case "Work from office":
      return "p-2 text-mc-blue bg-ev-ice rounded-lg text-center";
    case "Absent":
      return "p-2 text-mc-red bg-ev-pink rounded-lg text-center";
    case "Late arrival":
      return "p-2 text-mc-yellow bg-mc-soft-yellow rounded-lg text-center";
    case "Work from home":
      return "p-2 text-ev-dark-gray bg-ev-gray-button rounded-lg text-center";
    default:
        return "";
  }
}

function ContentBlockElement({
  containerClassName,
  boxClassName,
  id,
  employee,
  role,
  department,
  date,
  status,
  profilePicture,
  link,
  linkValue,
}: ContentBlockElementProps) {
  return (
    <section
      className={`w-full flex justify-between items-center align-middle pt-4 pb-4 border-b-2 ${containerClassName || ""}`}
    >
      <section
        className={`grid grid-cols-7 gap-6 w-[75%] ${boxClassName || ""}`}
      >
        <p className="flex items-center">{id}</p>
        <p className="flex items-center">{employee}</p>
        <p className="flex items-center">{role}</p>
        <p className="flex items-center">{department}</p>
        <p className="flex items-center">{date}</p>
        <p className={statusClass(status)}>{status}</p>
        {profilePicture && (
          <Image
            src={profilePicture}
            alt="Employee profile picture"
            width={0}
            height={0}
            className="rounded-full h-auto w-10"/>
        )}
      </section>
      <Link
        href={{
          pathname: `/${link}`,
          query: { id, employee, role, department, profilePicture },
        }}
      >
        <Input
          name={link}
          type="button"
          className="text-white bg-mc-blue rounded-lg max-w-52 min-w-24 w-[12vw] max-h-11 min-h-6 h-[6.5vh] pl-4 pr-4 hover:scale-110 duration-300"
          value={linkValue}
        />
      </Link>
    </section>
  );
}

export default ContentBlockElement;
