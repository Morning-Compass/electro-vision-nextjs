"use client";
import ContentBlock from "@/components/ContentBlock";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import useUserContext from "@/ev-contexts/userContextProvider";
import { isBase64Image } from "@/ev-lib/fileUtils";
import Image from "next/image";
import Link from "next/link";

// Helper function to format dates
const formatDate = (date: string | Date | null): string => {
  if (!date) return "Not Defined";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

export default function Page() {
  const { User, UserDispatch } = useUserContext();
  console.log(User);

  const multimedia = User.workspaceData?.currentTask?.description_multimedia;
  const task = User.workspaceData?.currentTask;

  const imageSrc =
    multimedia && isBase64Image(multimedia) ? multimedia : "/tasks.svg";

  return (
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
              <h1 className="text-4xl font-bold text-ev-darkblue dark:text-ev-text uppercase tracking-wide text-center flex-grow">
                {task?.title ?? "Untitled Task"}
              </h1>
              <div className="w-16"></div> {/* Spacer for balance */}
            </div>

            {/* Description and Photo (horizontal) */}

            <div className="flex flex-row gap-8 w-full h-[45%]">
              {/* Description */}
              {task?.description ? (
                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl overflow-y-scroll shadow-md">
                  <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                    <h2 className="text-2xl font-semibold text-ev-darkblue dark:text-ev-text">
                      Description
                    </h2>
                  </div>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                    {task?.description ?? "Description has not been set."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl overflow-y-scroll shadow-md">
                  <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                    <h2 className="text-2xl font-semibold text-ev-darkblue dark:text-ev-text">
                      Description
                    </h2>
                  </div>
                  <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                    Add Description TBI
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl overflow-y-scroll shadow-md">
                <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                  <h2 className="text-2xl font-semibold text-ev-darkblue dark:text-ev-text">
                    More
                  </h2>
                </div>
                <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Assigner: {task?.assigner_username}
                </p>
                <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Assignee: {task?.assignee_username}
                </p>
                <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Status: {task?.status}
                </p>
                <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Created at:{" "}
                  {task?.created_at ? formatDate(task.created_at) : "Unknown"}
                </p>
                <p className="text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Due:{" "}
                  {task?.due_date ? formatDate(task.due_date) : "Not Defined"}
                </p>
                <p
                  className={`text-ev-darkgray dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full ${
                    task?.importance === "LOW"
                      ? "text-green-400"
                      : task?.importance === "MEDIUM"
                        ? "text-yellow-500"
                        : "text-red-600"
                  }`}
                >
                  Importance: {task?.importance}
                </p>
              </div>

              {/* Photo */}
              {isBase64Image(imageSrc) ? (
                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md">
                  <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                    <h2 className="text-2xl font-semibold text-ev-darkblue dark:text-ev-text">
                      Photo
                    </h2>
                  </div>
                  <div className="relative w-full h-full">
                    <Image
                      src={imageSrc}
                      alt="Task"
                      fill
                      className="object-contain"
                      unoptimized={isBase64Image(imageSrc)}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Map Section (full width below) */}
            <div className="flex flex-col gap-4 w-full h-[45%] p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md">
              <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                <h2 className="text-2xl font-semibold text-ev-darkblue dark:text-ev-text">
                  Map
                </h2>
              </div>
              <div className="flex items-center justify-center bg-ev-gray dark:bg-ev-dark-gray w-full h-full rounded-lg text-ev-darkgray dark:text-ev-secondary-text text-lg">
                Content
                {/* FUTURE MAP LINK AND PREVIEW */}
              </div>
            </div>
          </div>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
