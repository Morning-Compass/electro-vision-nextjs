import Input from "@/components/Input";
import Link from "next/link";

export type ChatElementProps = {
  containerClassName?: string;
  boxClassName?: string;
  id: number;
  employee: string;
  role: string;
  department: string;
};

function ChatElement({
  containerClassName,
  boxClassName,
  id,
  employee,
  role,
  department,
}: ChatElementProps) {
  return (
    <section
      className={`w-full flex justify-between items-center mt-8 border-t-4 ${containerClassName || ""}`}
    >
      <section
        className={`grid grid-cols-4 gap-4 w-[60%] ${boxClassName || ""}`}
      >
        <p>{id}</p>
        <p>{employee}</p>
        <p>{role}</p>
        <p>{department}</p>
      </section>
      <Link
        href={{
          pathname: `/chat/employee`,
          query: { id, employee, role, department },
        }}
      >
        <Input
          name="chat"
          type="button"
          className="text-white border-4 bg-mc-blue border-none rounded-[0.9rem] max-w-[12rem] min-w-24 w-[12vw] max-h-8 min-h-6 h-[6.5vh] pl-4 pr-4 hover:scale-110 duration-300"
          value="chat"
        />
      </Link>
    </section>
  );
}

export default ChatElement;
