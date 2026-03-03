"use client";

import useUserContext from "@/ev-contexts/userContextProvider";
import { isBase64Image } from "@/ev-lib/fileUtils";
import { WorkspaceUser } from "@/ev-types/user-types";
import { Task } from "@/ev-types/workspace-types";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";

type TaskEntryProps = {
  task: Task;
  workspaceUsers: WorkspaceUser[] | null;
  selectable: boolean;
  setSelectedTasksIds: Dispatch<SetStateAction<number[]>>;
  selectedTasksIds: number[];
};

const importanceColors: Record<string, string> = {
  LOW: "bg-green-500/15 text-green-400 border-green-500/30",
  MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-red-500/15 text-red-400 border-red-500/30",
};

const statusColors: Record<string, string> = {
  TODO: "bg-slate-500/15 text-slate-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  HELP_NEEDED: "bg-orange-500/15 text-orange-400",
  CANCELED: "bg-red-500/15 text-red-400",
};

const statusLabel: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Done",
  HELP_NEEDED: "Help Needed",
  CANCELED: "Canceled",
};

export default function TaskEntry({
  task,
  workspaceUsers,
  selectable = false,
  setSelectedTasksIds,
  selectedTasksIds,
}: TaskEntryProps) {
  const { id, title, status, importance, description_multimedia, category } = task;
  const { User, UserDispatch } = useUserContext();

  const isSelected = selectedTasksIds.includes(id);
  const isbase64 = isBase64Image(description_multimedia);
  const hasImage = isbase64 && description_multimedia;

  const statusFile = {
    HELP_NEEDED: "helpneeded-color.png",
    IN_PROGRESS: "workinprogress-color.png",
    COMPLETED: "completed-color.png",
    CANCELED: "cancel-color.png",
    TODO: "todo-color2.png",
  }[status ?? "TODO"] ?? "todo-color2.png";

  const content = (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 border transition-all duration-150
        ${selectable
          ? isSelected
            ? "bg-red-500/10 border-red-500/40 cursor-pointer"
            : "bg-[#0f172a] border-[#334155] hover:border-[#475569] cursor-pointer"
          : "bg-[#0f172a] border-[#334155] hover:border-ev-yellow/30 hover:bg-[#0f172a]"
        }
      `}
      onClick={
        selectable
          ? () =>
              setSelectedTasksIds((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id]
              )
          : undefined
      }
    >
      {/* status icon */}
      <div className="w-9 h-9 rounded-lg bg-[#1e293b] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {hasImage ? (
          <Image
            src={description_multimedia!}
            alt={title}
            width={36}
            height={36}
            className="object-cover w-full h-full rounded-lg"
            unoptimized
          />
        ) : (
          <Image
            src={`/tasks/${statusFile}`}
            alt={status ?? "task"}
            width={22}
            height={22}
            className="object-contain"
          />
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[status ?? "TODO"] ?? statusColors["TODO"]}`}>
            {statusLabel[status ?? "TODO"] ?? status}
          </span>
          {category && (
            <span className="text-[10px] text-slate-500">{category}</span>
          )}
        </div>
      </div>

      {/* importance */}
      <span
        className={`text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${
          importanceColors[importance ?? "LOW"] ?? importanceColors["LOW"]
        }`}
      >
        {importance ?? "LOW"}
      </span>

      {/* selection checkbox */}
      {selectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 accent-red-500 flex-shrink-0 pointer-events-none"
        />
      )}
    </div>
  );

  if (selectable) return <div>{content}</div>;

  return (
    <Link
      href="/workspaces/plans/tasks/details"
      prefetch={false}
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
          value: { ...prevData, currentTask: task, users: workspaceUsers },
        });
      }}
    >
      {content}
    </Link>
  );
}
