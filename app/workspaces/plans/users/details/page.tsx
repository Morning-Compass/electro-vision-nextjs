// pages/workspaces/users/[id].tsx
"use client";
import ContentBlock from "@/components/ContentBlock";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WorkspaceUser } from "@/ev-types/user-types";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import toast from "react-hot-toast";

export default function WorkerDetailsPage() {
  const { User, UserDispatch } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const worker = User.workspaceData?.users?.find(
    (u) => u.id === User.workspaceData?.currentUserId,
  );

  return (
    worker && (
      <PageTemplate>
        <NavbarTemplate />
        <section className="flex flex-row items-center justify-start h-full gap-8 w-[90vw]">
          <SidebarTemplate activeIcon="task" />
          <ContentBlock>
            <div className="flex flex-col items-center justify-center gap-8 h-full w-full p-4">
              {/* Title and Back Button Row */}
              <div className="w-full flex items-center justify-between">
                <Link
                  href="/workspaces/plans"
                  className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium flex items-center transition-colors duration-200"
                >
                  ← Back
                </Link>
                <h1 className="text-4xl font-bold text-ev-text dark:text-ev-text uppercase tracking-wide text-center flex-grow max-md:text-2xl">
                  User In Workspace
                </h1>
                <div className="w-16"></div>
              </div>

              <div className="flex flex-row gap-8 w-full h-[70%] max-md:flex-col max-md:items-center">
                {/* Worker Photo and Basic Info */}
                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md items-center justify-center max-md:w-auto">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden">
                    <Image
                      src={"/default-user.png"} // Assuming profile_picture exists on WorkspaceUser
                      alt={worker.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-3xl font-semibold text-ev-text dark:text-ev-text mt-4">
                    {worker.username}
                  </h2>
                </div>

                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md max-md:h-auto md:overflow-y-scroll max-md:w-auto max-md:mb-8">
                  <h2 className="text-2xl font-semibold text-ev-text dark:text-ev-text border-b-2 border-ev-gray pb-2">
                    Additional Details
                  </h2>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Username: {worker.username}
                  </p>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Email: {worker.email}
                  </p>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Position: {worker.position || "N/A"}
                  </p>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Role: {worker.workspace_role ?? "Not Assigned"}
                  </p>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg">
                    Id: {worker.id}
                  </p>
                </div>
              </div>
            </div>
          </ContentBlock>
        </section>
        <FooterSmall />
      </PageTemplate>
    )
  );
}
