import useUserContext from "@/ev-contexts/userContextProvider";
import { Workspace } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import { copyFileSync } from "node:fs";
import React from "react";

type WorkspaceEntryProps = {
  workspace: Workspace;
};

const WorkspaceEntry = ({ workspace }: WorkspaceEntryProps) => {
  const { UserDispatch } = useUserContext();
  const isSvg =
    typeof workspace.coverPhoto === "string" &&
    (workspace.coverPhoto?.trim().startsWith("<svg") ||
      workspace.coverPhoto?.trim().startsWith("<?xml"));

  // Convert SVG string to data URL
  const imageSrc = isSvg
    ? `data:image/svg+xml,${encodeURIComponent(workspace.coverPhoto)}`
    : "/problem.png";

  return (
    <section
      key={workspace.id}
      onClick={() =>
        UserDispatch({ type: "setCurrentWorkspace", value: workspace })
      }
      className="flex flex-col items-center p-6 bg-ev-primary-bg rounded-xl hover:bg-ev-primary-hover transition-colors cursor-pointer "
    >
      <Link
        href={`/workspaces/plans/?coverImage=${encodeURIComponent(imageSrc)}`}
        className="w-full"
      >
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
            unoptimized={isSvg} // Disable optimization for SVG
          />
        </div>
      </Link>
      <h3 className="mt-4 text-xl font-semibold text-center group-hover:text-blue-600 transition-colors truncate w-full">
        {workspace.name}
      </h3>
    </section>
  );
};

export default WorkspaceEntry;
