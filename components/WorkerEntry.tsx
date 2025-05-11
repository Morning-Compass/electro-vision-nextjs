import Image from "next/image";
import Input from "./Input";
import Link from "next/link";
import useUserContext from "@/ev-contexts/userContextProvider";

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
  const { User } = useUserContext();

  return (
    <>
      <Link href={"/workspace/user/details"}>
        <div className="flex justify-start items-center gap-2 flex-row w-full hover:bg-ev-primary-bg hover:scale-110 duration-300  rounded-xl p-1">
          <Image
            src={photo ?? "/employee.png"}
            alt="Employee"
            width={56}
            height={56}
            className="rounded-full m-2"
          />
          <p className="text-xl text-nowrap m-2">
            {id === (User.authUser?.id ?? -1) ? "(You) " + username : username}
          </p>
        </div>
      </Link>
    </>
  );
}
