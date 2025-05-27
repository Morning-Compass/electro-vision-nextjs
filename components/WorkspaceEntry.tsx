"use client";

import useUserContext from "@/ev-contexts/userContextProvider";
import { Workspace } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type WorkspaceEntryProps = {
  workspace: Workspace;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSelected: boolean;
  onToggleSelect: (workspaceId: number, isChecked: boolean) => void;
};

const WorkspaceEntry = ({
  workspace,
  setLoading,
  isSelected,
  onToggleSelect,
}: WorkspaceEntryProps) => {
  const { User, UserDispatch } = useUserContext();

  const getSvgDataUri = (rawSvg: string): string => {
    try {
      const cleanedSvg = rawSvg.replace(/<\?xml[\s\S]*?\?>/g, "").trim();
      if (!cleanedSvg.startsWith("<svg")) {
        throw new Error("Invalid SVG content");
      }
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`;
    } catch (error) {
      console.error("Error processing SVG:", error);
      return "/problem.png";
    }
  };

  const getImageSrc = () => {
    if (!workspace.coverPhoto) return "/problem.png";

    if (typeof workspace.coverPhoto === "string") {
      if (
        workspace.coverPhoto.startsWith("data:") ||
        workspace.coverPhoto.startsWith("http")
      ) {
        return workspace.coverPhoto;
      }

      if (workspace.coverPhoto.trim().startsWith("<")) {
        return getSvgDataUri(workspace.coverPhoto);
      }
    }

    return "/problem.png";
  };

  const imageSrc = getImageSrc();

  return (
    <section className="relative flex flex-col items-center p-6 bg-ev-primary-bg rounded-xl hover:bg-ev-primary-hover transition-colors cursor-pointer group">
      <input
        type="checkbox"
        className={`absolute top-2 left-2 z-10 w-5 h-5 checked:accent-ev-red transition-opacity cursor-pointer
          ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect(workspace.id, e.target.checked);
        }}
        onClick={(e) => e.stopPropagation()}
      />

      <div
        onClick={() =>
          UserDispatch({
            type: "setWorkspaceData",
            value: {
              currentWorkspace: workspace,
              currentTask: User.workspaceData?.currentTask ?? null,
              currentUserOverviewData:
                User.workspaceData?.currentUserOverviewData ?? null,
              currentUserId: null,
              users: null,
            },
          })
        }
      >
        <Link href={`/workspaces/plans`} prefetch={false} className="w-full">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow bg-gray-100">
            <Image
              src={imageSrc}
              alt={workspace.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/problem.png";
              }}
              unoptimized={imageSrc.startsWith("data:image/svg+xml")}
            />
          </div>
        </Link>
        <h3 className="mt-4 text-xl font-semibold text-center group-hover:text-blue-600 transition-colors truncate w-full">
          {workspace.name}
        </h3>
      </div>
    </section>
  );
};

export default WorkspaceEntry;
