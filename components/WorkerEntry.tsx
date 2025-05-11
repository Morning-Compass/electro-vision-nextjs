import Image from "next/image";
import Input from "./Input";
import Link from "next/link";

type WorkerEntryProps = {
  username: string;
  photo?: string | null;
  id: number;
};

export default function WorkerEntry({
  username,
  photo = undefined,
  id,
}: WorkerEntryProps) {
  return (
    <>
      <div className="flex justify-between items-center gap-6 flex-row w-full">
        <Image
          src={photo ?? "/employee.png"}
          alt="Employee"
          width={56}
          height={56}
          className="rounded-full"
        />
        <p className="text-xl text-nowrap">{username}</p>
        <Link href={"/workspace/user/details"}>
          <Input
            name="details"
            type="button"
            value="..."
            className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-110 duration-300 ml-2"
          />
        </Link>
      </div>
    </>
  );
}
