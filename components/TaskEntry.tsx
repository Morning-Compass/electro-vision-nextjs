import Image from "next/image";
import Link from "next/link";

type TaskEntryProps = {
  title: string;
  photo?: string | null;
  status: string;
  importance: string;
};

export default function TaskEntry({
  title,
  photo = undefined,
  status,
  importance,
}: TaskEntryProps) {
  return (
    <>
      <Link href={"/workspace/task/details"}>
        <div className="flex justify-start items-center gap-2 flex-row w-full hover:bg-ev-primary-bg hover:scale-110 duration-300  rounded-xl p-1">
          <Image
            src={photo ?? "/employee.png"}
            alt="Employee"
            width={56}
            height={56}
            className="rounded-full m-2"
          />
          <p className="text-xl text-nowrap m-2">{title}</p>
          <p className="text-xl text-nowrap m-2">{status}</p>
          <p className="text-xl text-nowrap m-2">{importance}</p>
        </div>
      </Link>
    </>
  );
}
