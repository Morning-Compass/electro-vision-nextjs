import { Workspace } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type WorkspaceEntryProps = {
  workspace: Pick<Workspace, "id" | "name" | "coverPhoto">;
};

const WorkspaceEntry = ({ workspace }: WorkspaceEntryProps) => {
  const isSvg =
    typeof workspace.coverPhoto === "string" &&
    workspace.coverPhoto?.trim().startsWith("<svg");

  const imageSrc =
    typeof workspace.coverPhoto === "string" && workspace.coverPhoto && !isSvg
      ? workspace.coverPhoto
      : "/problem.png";

  return (
    <section className="flex flex-col items-center group p-4 bg-ev-primary-bg rounded-xl">
      <Link href={`/workspaces/plans/${workspace.id.toString()}`}>
        <div className="relative w-[30rem] h-64 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow bg-gray-100">
          {isSvg ? (
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{
                __html: workspace.coverPhoto as string,
              }}
            />
          ) : (
            <Image
              src={imageSrc}
              alt={workspace.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/problem.png";
              }}
            />
          )}
        </div>
      </Link>
      <h3 className="mt-4 text-xl font-semibold text-center group-hover:text-blue-600 transition-colors">
        {workspace.name}
      </h3>
    </section>
  );
};

export default WorkspaceEntry;
