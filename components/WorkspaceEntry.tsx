// components/WorkspaceEntry.tsx
import useUserContext from "@/ev-contexts/userContextProvider";
import { Workspace } from "@/ev-types/workspace-types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MapPin } from "lucide-react";

type WorkspaceEntryProps = {
  workspace: Workspace;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSelected?: boolean;
  onToggleSelect?: (workspaceId: number, isChecked: boolean) => void;
};

const WorkspaceEntry = ({
  workspace,
  isSelected = false,
  onToggleSelect,
}: WorkspaceEntryProps) => {
  const { User, UserDispatch } = useUserContext();

  const getSvgDataUri = (rawSvg: string): string => {
    try {
      const cleanedSvg = rawSvg.replace(/<\?xml[\s\S]*?\?>/g, "").trim();
      if (!cleanedSvg.startsWith("<svg"))
        throw new Error("Invalid SVG content");
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
      )
        return workspace.coverPhoto;
      if (workspace.coverPhoto.trim().startsWith("<"))
        return getSvgDataUri(workspace.coverPhoto);
    }
    return "/problem.png";
  };

  const imageSrc = getImageSrc();

  const handleDispatch = () => {
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
    });
  };

  return (
    <div
      className={`relative flex flex-col bg-[#1e293b] border rounded-2xl overflow-hidden group transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-ev-yellow shadow-[0_0_0_2px_rgba(246,170,28,0.3)]"
          : "border-[#334155] hover:border-[#475569]"
      }`}
    >
      {/* selection checkbox */}
      {onToggleSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(workspace.id, e.target.checked);
            }}
            className="w-4 h-4 accent-ev-yellow cursor-pointer"
          />
        </div>
      )}

      {/* cover image */}
      <Link href="/workspaces/plans" prefetch={false} onClick={handleDispatch}>
        <div className="relative aspect-video w-full overflow-hidden bg-white">
          <Image
            src={imageSrc}
            alt={workspace.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/problem.png";
            }}
            unoptimized={imageSrc.startsWith("data:image/svg+xml")}
          />
        </div>

        {/* info */}
        <div className="p-4">
          <h3 className="text-slate-100 font-semibold text-sm truncate group-hover:text-ev-yellow transition-colors">
            {workspace.name}
          </h3>
          {workspace.geolocation && (
            <p className="flex items-center gap-1 text-slate-500 text-xs mt-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {workspace.geolocation}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default WorkspaceEntry;
