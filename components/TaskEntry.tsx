import useUserContext from "@/ev-contexts/userContextProvider";
import { WorkspaceData } from "@/ev-types/user-types";
import { Task } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type TaskEntryProps = {
  task: Task;
};

function isBase64Image(data: string | null | undefined): boolean {
  return !!data && /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(data);
}

export default function TaskEntry({ task }: TaskEntryProps) {
  const { id, title, status, importance, description_multimedia } = task;
  const [statusFile, setStatusFile] = useState<string>("todo.png");
  const [importanceFile, setImportanceFile] = useState<string>("low.png");
  const { User, UserDispatch } = useUserContext();

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
        statusFileName = "todo-color.png";
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

  const imageSrc = isBase64Image(description_multimedia)
    ? description_multimedia!
    : "/tasks/" + statusFile;

  return (
    <div
      onClick={() => {
        const prevData = User.workspaceData ?? {
          currentWorkspace: null,
          currentTask: null,
          currentUserOverviewData: null,
        };

        UserDispatch({
          type: "setWorkspaceData",
          value: {
            ...prevData,
            currentTask: task,
          },
        });
      }}
    >
      <Link href={"/workspaces/tasks/details"}>
        <div className="flex justify-start items-center gap-2 flex-row w-full hover:bg-ev-primary-bg hover:scale-110 duration-300 rounded-xl p-1">
          <Image
            src={imageSrc}
            alt="Task"
            width={56}
            height={56}
            className="rounded-full m-2"
          />
          <p className="text-xl text-nowrap m-2">{title}</p>
          <p
            className={`text-xl text-nowrap m-2 ${
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
