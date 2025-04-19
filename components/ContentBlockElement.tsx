import Input from "@/components/Input";
import Link from "next/link";

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
        <p>{id}</p>
        <p>{employee}</p>
        <p>{role}</p>
        <p>{department}</p>
        <p>{date}</p>
        <p>{status}</p>
        <p>{profilePicture}</p>
      </section>
      <Link
        href={{
          pathname: `/${link}/employee`,
          query: { id, employee, role, department },
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
