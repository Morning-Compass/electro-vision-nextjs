import Image from "next/image";
import Input from "./Input";
import Link from "next/link";
import useUserContext from "@/ev-contexts/userContextProvider";
import { Dispatch, SetStateAction, useState } from "react";
import { WorkspaceUser } from "@/ev-types/user-types";

type WorkerEntryProps = {
  username: string;
  photo?: string | null;
  id: number;
  selectable: boolean;
  setSelectedWorkersIds: Dispatch<SetStateAction<number[]>>;
  selectedWorkersIds: number[];
  workspaceUsers: WorkspaceUser[];
  role: string;
};

export default function WorkerEntry({
  username,
  photo = undefined,
  id,
  selectable = false,
  workspaceUsers,
  selectedWorkersIds,
  setSelectedWorkersIds,
  role,
}: WorkerEntryProps) {
  const { User, UserDispatch } = useUserContext();
  const [selected, setSelected] = useState(false);
  const you = id === parseInt(User.authUser?.id ?? "-1");

  return selectable ? (
    <div>
      <div
        className={`flex justify-start items-center gap-2 flex-row w-full bg-ev-primary${!you ? (selected ? "border-2 border-ev-red" : "border-2 border-ev-green") : ""} shadow-md  hover:scale-110 duration-300  rounded-xl p-1 `}
        onClick={() => {
          if (you) {
            return;
          }
          setSelectedWorkersIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
          );
          setSelected((p) => !p);
        }}
      >
        <Image
          src={photo ?? "/default-user.png"}
          alt="Employee"
          width={56}
          height={56}
          className="rounded-full m-2"
        />
        <p className="text-xl text-nowrap m-2 max-sm:text-base">
          {id === (User.authUser?.id ?? -1) ? "(You) " + username : username}
        </p>
      </div>
    </div>
  ) : (
    <Link
      onClick={() => {
        const prevData = User.workspaceData ?? {
          currentWorkspace: null,
          currentTask: null,
          currentUserOverviewData: null,
          users: null,
          currentUserId: null,
        };

        UserDispatch({
          type: "setWorkspaceData",
          value: {
            ...prevData,
            currentUserId: id,
            users: workspaceUsers,
          },
        });
      }}
      prefetch={false}
      href={"/workspaces/plans/users/details"}
    >
      <div className="flex justify-start items-center gap-2 flex-row w-full bg-ev-primary shadow-md  hover:scale-110 duration-300  rounded-xl p-1">
        <Image
          src={photo ?? "/default-user.png"}
          alt="Employee"
          width={56}
          height={56}
          className="rounded-full m-2"
        />
        <p className="text-xl text-nowrap m-2 max-sm:text-base">
          {id === (User.authUser?.id ?? -1) ? "(You) " + username : username}
        </p>
        <p className="text-xl text-nowrap m-2 max-sm:text-base ml-auto pr-1">
          {role}
        </p>
      </div>
    </Link>
  );
}
