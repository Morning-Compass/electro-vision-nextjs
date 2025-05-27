import useUserContext from "@/ev-contexts/userContextProvider";
import { isBase64Image } from "@/ev-lib/fileUtils";
import { WorkspaceData, WorkspaceUser } from "@/ev-types/user-types";
import { Task } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

type TaskEntryProps = {
  task: Task;
  workspaceUsers: WorkspaceUser[] | null;
  selectable: boolean;
  setSelectedTasksIds: Dispatch<SetStateAction<number[]>>;
  selectedTasksIds: number[];
};

export default function TaskEntry({
  task,
  workspaceUsers,
  selectable = false,
  setSelectedTasksIds,
  selectedTasksIds,
}: TaskEntryProps) {
  const { id, title, status, importance, description_multimedia } = task;
  const [statusFile, setStatusFile] = useState<string>("todo.png");
  const [importanceFile, setImportanceFile] = useState<string>("low.png");
  const { User, UserDispatch } = useUserContext();
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    let statusFileName = "todo.png"; // Default value
    let importanceFileName = "low.png"; // Default value

    // Set status file based on status
    switch (status) {
      case "HELP_NEEDED":
        statusFileName = "helpneeded-color.png";
        break;
      case "IN_PROGRESS":
        statusFileName = "workinprogress-color.png";
        break;
      case "COMPLETED":
        statusFileName = "completed-color.png";
        break;
      case "CANCELED":
        statusFileName = "cancel-color.png";
        break;
      default:
        statusFileName = "todo-color2.png";
    }

    // Set importance file based on importance
    switch (importance) {
      case "MEDIUM":
        importanceFileName = "medium.png";
        break;
      case "HIGH":
        importanceFileName = "high.png";
        break;
      default:
        importanceFileName = "low.png";
    }

    setStatusFile(statusFileName);
    setImportanceFile(importanceFileName);
  }, [status, importance]);

  const isbase64 = isBase64Image(description_multimedia);

  const imageSrc = isbase64 ? description_multimedia! : "/tasks/" + statusFile;

  return selectable ? (
    <div>
      <div className="flex justify-start items-center gap-2 flex-row w-full bg-ev-primary shadow-md hover:scale-105 duration-300 rounded-xl p-1">
        <Image
          src={imageSrc}
          alt="Task"
          width={56}
          height={56}
          unoptimized={isBase64Image(imageSrc)}
          className={` ${isbase64 ? "rounded-full" : ""} m-2 aspect-square bg-ev-primary`}
        />
        <p className="text-xl text-nowrap m-2">{title}</p>
        <p
          className={`text-xl text-nowrap ml-auto p-4 ${
            importance === "LOW"
              ? "text-green-400"
              : importance === "MEDIUM"
                ? "text-yellow-500"
                : "text-red-600"
          }`}
        >
          {importance}
        </p>
      </div>
    </div>
  ) : (
    <div>
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
              currentTask: task,
              users: workspaceUsers,
            },
          });
        }}
        prefetch={false}
        href={"/workspaces/plans/tasks/details"}
      >
        <div className="flex justify-start items-center gap-2 flex-row w-full bg-ev-primary shadow-md hover:scale-105 duration-300 rounded-xl p-1">
          <Image
            src={imageSrc}
            alt="Task"
            width={56}
            height={56}
            unoptimized={isBase64Image(imageSrc)}
            className={` ${isbase64 ? "rounded-full" : ""} m-2 aspect-square bg-ev-primary`}
          />
          <p className="text-xl text-nowrap m-2">{title}</p>
          <p
            className={`text-xl text-nowrap ml-auto p-4 ${
              importance === "LOW"
                ? "text-green-400"
                : importance === "MEDIUM"
                  ? "text-yellow-500"
                  : "text-red-600"
            }`}
          >
            {importance}
          </p>
        </div>
      </Link>
    </div>
  );
}
