// components/WorkspaceEntry.tsx
import useUserContext from "@/ev-contexts/userContextProvider";
import { Workspace } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type WorkspaceEntryProps = {
  workspace: Workspace;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const WorkspaceEntry = ({ workspace, setLoading }: WorkspaceEntryProps) => {
  const { User, UserDispatch } = useUserContext();

  const getSvgDataUri = (rawSvg: string): string => {
    try {
      // Remove XML prolog and trim whitespace
      const cleanedSvg = rawSvg.replace(/<\?xml[\s\S]*?\?>/g, "").trim();

      // Check if it's valid SVG
      if (!cleanedSvg.startsWith("<svg")) {
        throw new Error("Invalid SVG content");
      }

      // Encode and create data URI
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`;
    } catch (error) {
      console.error("Error processing SVG:", error);
      return "/problem.png";
    }
  };

  const getImageSrc = () => {
    if (!workspace.coverPhoto) return "/problem.png";

    // If it's already a data URL or regular URL
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
    <section
      key={workspace.id}
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
      className="flex flex-col items-center p-6 bg-ev-primary-bg rounded-xl hover:bg-ev-primary-hover transition-colors cursor-pointer"
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
    </section>
  );
};

export default WorkspaceEntry;
