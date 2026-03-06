import Link from "next/link";
import useUserContext from "@/ev-contexts/userContextProvider";
import { Dispatch, SetStateAction } from "react";
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
  id,
  selectable = false,
  workspaceUsers,
  selectedWorkersIds,
  setSelectedWorkersIds,
  role,
}: WorkerEntryProps) {
  const { User, UserDispatch } = useUserContext();
  const you = id === parseInt(User.authUser?.id ?? "-1");
  const isSelected = selectedWorkersIds.includes(id);

  const initials = username
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const content = (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 border transition-all duration-150
        ${selectable
          ? isSelected
            ? "bg-red-500/10 border-red-500/40 cursor-pointer"
            : you
              ? "bg-[#0f172a] border-[#334155] opacity-50 cursor-not-allowed"
              : "bg-[#0f172a] border-[#334155] hover:border-[#475569] cursor-pointer"
          : "bg-[#0f172a] border-[#334155] hover:border-ev-yellow/30"
        }
      `}
      onClick={
        selectable && !you
          ? () =>
              setSelectedWorkersIds((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id],
              )
          : undefined
      }
    >
      {/* avatar */}
      <div className="w-9 h-9 rounded-lg bg-[#1e293b] flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-ev-yellow">{initials}</span>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">
          {you ? `${username} (You)` : username}
        </p>
        {role && (
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{role}</p>
        )}
      </div>

      {/* selection checkbox */}
      {selectable && !you && (
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
      href="/workspaces/plans/users/details"
    >
      {content}
    </Link>
  );
}
