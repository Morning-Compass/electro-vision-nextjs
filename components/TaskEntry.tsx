import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [statusFile, setStatusFile] = useState<string>("todo.png");
  const [importanceFile, setImportanceFile] = useState<string>("low.png");

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
        statusFileName = "cancel-color.png"; // Fixed typo from "cancel-colo.png"
        break;
      default: // Includes "TODO" case
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
      default: // Includes "LOW" case
        importanceFileName = "low.png";
    }

    // Update state
    setStatusFile(statusFileName);
    setImportanceFile(importanceFileName);
  }, [status, importance]); // Only re-run when status or importance changes

  return (
    <>
      <Link href={"/workspace/task/details"}>
        <div className="flex justify-start items-center gap-2 flex-row w-full hover:bg-ev-primary-bg hover:scale-110 duration-300  rounded-xl p-1">
          <Image
            src={photo ?? "/tasks/" + statusFile}
            alt="Employee"
            width={56}
            height={56}
            className="rounded-full m-2"
          />
          {/*
          <Image
            src={photo ?? "/employee.png"}
            alt="Employee"
            width={56}
            height={56}
            className="rounded-full m-2"
          />
          */}
          <p className="text-xl text-nowrap m-2">{title}</p>
          <p
            className={`text-xl text-nowrap m-2 ${importance === "LOW" ? "text-green-400" : importance === "MEDIUM" ? "text-yellow-500" : "text-red-600"}`}
          >
            {importance}
          </p>
        </div>
      </Link>
    </>
  );
}
