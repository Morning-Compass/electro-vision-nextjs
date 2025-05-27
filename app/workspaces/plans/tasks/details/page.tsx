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
import { useState } from "react";
import { useForm } from "react-hook-form";
import Overlay from "@/components/Overlay";
import Input from "@/components/Input";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import { WorkspaceUser } from "@/ev-types/user-types";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import { Task } from "@/ev-types/workspace-types";
import toast from "react-hot-toast";
import { DateTimePicker } from "@/components/datepicker/Datepicker";

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

type EditDescriptionForm = {
  description: string;
};

type EditTaskDetailsForm = {
  assignee_email: string;
  title: string;
  status: "HELP_NEEDED" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  importance: "LOW" | "MEDIUM" | "HIGH";
  due_date: string;
  category: string;
};

type EditPhotoForm = {
  multimedia: string;
};

export default function Page() {
  const { User, UserDispatch } = useUserContext();
  console.log(User);

  const multimedia = User.workspaceData?.currentTask?.description_multimedia;
  const task = User.workspaceData?.currentTask;

  console.log(task);

  const creator = User.workspaceData?.currentWorkspace?.role === "CREATOR";

  // States for edit modes and overlays
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  const workspaceUsers = User.workspaceData?.users;

  const isMultimedia =
    task?.description_multimedia !== "" &&
    task?.description_multimedia !== null &&
    task?.description_multimedia !== undefined;
  // Forms
  const { register: registerDesc, handleSubmit: handleSubmitDesc } =
    useForm<EditDescriptionForm>({
      defaultValues: {
        description: task?.description || "",
      },
    });

  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    control,
  } = useForm<EditTaskDetailsForm>({
    defaultValues: {
      assignee_email: task?.assignee_email || "",
      status: task?.status || "TODO",
      importance: task?.importance || "MEDIUM",
      due_date: task?.due_date
        ? new Date(task.due_date).toISOString().split("T")[0]
        : "",
    },
  });

  const {
    register: registerPhoto,
    setValue: setPhotoValue,
    watch: watchPhoto,
    handleSubmit: handleSubmitPhoto,
  } = useForm<EditPhotoForm>({
    defaultValues: {
      multimedia: multimedia || "",
    },
  });

  const imageSrc =
    watchPhoto("multimedia") ||
    (multimedia && isBase64Image(multimedia) ? multimedia : "/tasks.svg");

  // Submit handlers
  const onSubmitDescription = async (data: EditDescriptionForm) => {
    // TODO: Implement API call to update description
    try {
      console.log("Updating description:", data);
      setIsEditingDescription(false);

      const res = await OLF.put(
        ApiLinks.updateTask(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          User.workspaceData?.currentTask?.id.toString() ?? "-1",
        ),
        {
          assigner_email: null,
          assignee_email: null,
          description: data.description,
          due_date: null,
          status: null,
          title: null,
          importance: null,
          category: null,
          description_multimedia: null,
        },
      );

      toast.success("Task description updated successfully");

      UserDispatch({
        type: "setWorkspaceData",
        value: {
          ...User.workspaceData!,
          currentTask: {
            ...User.workspaceData!.currentTask!,
            description: data.description,
          },
        },
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update task",
      );
    }
  };

  const onSubmitDetails = async (data: EditTaskDetailsForm) => {
    // TODO: Implement API call to update task details
    try {
      console.log("Updating task details:", data);
      setIsEditingDetails(false);

      const dueDateISO = data.due_date
        ? new Date(data.due_date).toISOString().split(".")[0]
        : null;

      const payload = {
        assigner_email: null,
        assignee_email: data.assignee_email,
        description: null,
        due_date: dueDateISO,
        status: data.status,
        title: data.title,
        importance: data.importance,
        category: data.category,
        description_multimedia: null,
      };

      console.log("Sending payload:", JSON.stringify(payload));

      const res = await OLF.put(
        ApiLinks.updateTask(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          User.workspaceData?.currentTask?.id.toString() ?? "-1",
        ),
        payload,
      );

      toast.success("Task details successfully");

      UserDispatch({
        type: "setWorkspaceData",
        value: {
          ...User.workspaceData!,
          currentTask: {
            ...User.workspaceData!.currentTask!,
            title: data.title,
            assignee_email: data.assignee_email,
            status: data.status,
            importance: data.importance,
            due_date: data.due_date ? new Date(data.due_date) : null,
            category: data.category,
          },
        },
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    }
  };

  const onSubmitPhoto = async (data: EditPhotoForm) => {
    // TODO: Implement API call to update photo
    try {
      console.log("Updating photo:", data);
      setIsEditingPhoto(false);

      const res = await OLF.put(
        ApiLinks.updateTask(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          User.workspaceData?.currentTask?.id.toString() ?? "-1",
        ),
        {
          assigner_email: null,
          assignee_email: null,
          description: null,
          due_date: null, // backend takes naivedatetime need to fxit
          status: null,
          title: null,
          importance: null,
          category: null,
          description_multimedia: data.multimedia,
        },
      );

      toast.success("Task Photo successfully");

      UserDispatch({
        type: "setWorkspaceData",
        value: {
          ...User.workspaceData!,
          currentTask: {
            ...User.workspaceData!.currentTask!,
            description_multimedia: data.multimedia,
          },
        },
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    }
  };

  return (
    <PageTemplate>
      <NavbarTemplate />
      <section className="flex flex-row items-center justify-start h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
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
              <h1 className="text-4xl font-bold text-ev-text uppercase tracking-wide text-center flex-grow">
                {task?.title ?? "Untitled Task"}
              </h1>
              <div className="w-16"></div> {/* Spacer for balance */}
            </div>

            {/* Description and Details (horizontal) */}
            <div className="flex flex-row gap-8 w-full h-[45%]">
              {/* Description */}
              <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl overflow-y-scroll shadow-md">
                <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                  <h2 className="text-2xl font-semibold  text-ev-text dark:text-ev-text">
                    Description
                  </h2>
                  {creator ? (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium transition-colors duration-200"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
                <p className="text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  {task?.description || "Description has not been set."}
                </p>
              </div>

              {/* Photo */}
              {isBase64Image(imageSrc) && (
                <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md">
                  <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                    <h2 className="text-2xl font-semibold text-ev-text dark:text-ev-text">
                      Photo
                    </h2>
                    {creator ? (
                      <button
                        onClick={() => setIsEditingPhoto(true)}
                        className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                    ) : null}
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
              )}

              {/* Details */}
              <div className="flex flex-col gap-4 w-1/2 p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl overflow-y-scroll shadow-md">
                <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                  <h2
                    className="text-2xl font-semibold text-ev-text text-
                    dark:text-ev-text"
                  >
                    Details
                  </h2>
                  <div className=" flex flex-row items-center justify-center gap-8">
                    {creator ? (
                      <>
                        {isMultimedia ? null : (
                          <button
                            onClick={() => setIsEditingPhoto(true)}
                            className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium transition-colors duration-200"
                          >
                            Add Photo
                          </button>
                        )}
                      </>
                    ) : null}

                    {creator ? (
                      <button
                        onClick={() => setIsEditingDetails(true)}
                        className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Assigner: {task?.assigner_email}
                </p>
                <p className="text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Assignee: {task?.assignee_email}
                </p>
                <p className="text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Status: {task?.status.replaceAll("_", " ")}
                </p>
                <p className="text-ev-dark dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Created at:{" "}
                  {task?.created_at ? formatDate(task.created_at) : "Unknown"}
                </p>
                <p className="text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Due:{" "}
                  {task?.due_date ? formatDate(task.due_date) : "Not Defined"}
                </p>
                <p className="text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full">
                  Category: {isMultimedia ? task.category : "Not Defined"}
                </p>
                <p
                  className={`text-ev-text dark:text-ev-secondary-text text-lg overflow-y-auto max-h-full ${
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
            </div>

            {/* Photo and Map Section (horizontal) */}
            <div className="flex flex-row gap-8 w-full h-[45%]">
              {/* Map Section */}
              <div className="flex flex-col gap-4 w-full p-6 bg-ev-primary-bg dark:bg-ev-secondary rounded-xl shadow-md">
                <div className="flex justify-between items-center border-b-2 border-ev-gray pb-2">
                  <h2 className="text-2xl font-semibold text-ev-text dark:text-ev-text">
                    Map
                  </h2>
                </div>
                <div className="flex items-center justify-center bg-ev-gray dark:bg-ev-dark-gray w-full h-full rounded-lg text-ev-text dark:text-ev-secondary-text text-lg">
                  Content
                  {/* FUTURE MAP LINK AND PREVIEW */}
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </section>
      <FooterSmall />

      {/* Edit Description Overlay */}
      <Overlay
        isOpen={isEditingDescription}
        onClose={() => setIsEditingDescription(false)}
      >
        <form
          onSubmit={handleSubmitDesc(onSubmitDescription)}
          className="flex flex-col gap-6 w-full"
        >
          <p className="text-4xl mb-10">Edit Description</p>
          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <textarea
                {...registerDesc("description")}
                placeholder="Task description..."
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full h-64"
              />
            </div>
          </FormErrorWrap>
          <div className="flex items-center justify-center gap-4 mt-4 w-full">
            <button
              type="submit"
              className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-105 duration-300 w-full"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Overlay>

      {/* Edit Details Overlay */}
      <Overlay
        isOpen={isEditingDetails}
        onClose={() => setIsEditingDetails(false)}
      >
        <form
          onSubmit={handleSubmitDetails(onSubmitDetails)}
          className="flex flex-col gap-6 w-full"
        >
          <p className="text-4xl mb-10">Edit Task Details</p>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Title</p>
              <Input
                placeholder="New title..."
                type="text"
                defaultValue={task?.title}
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full"
                register={registerDetails("title")}
              />
            </div>
          </FormErrorWrap>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Assignee Email</p>
              <select
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full hover:scale-105 transition appearance-none"
                {...registerDetails("assignee_email")}
              >
                {workspaceUsers &&
                  workspaceUsers.map((u, i) => {
                    return (
                      <option key={i} value={u.email}>
                        {u.email}
                      </option>
                    );
                  })}
              </select>
            </div>
          </FormErrorWrap>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Category</p>
              <Input
                placeholder="Category"
                type="text"
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full"
                register={registerDetails("category")}
              />
            </div>
          </FormErrorWrap>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Status</p>
              <select
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full hover:scale-105 transition appearance-none"
                {...registerDetails("status")}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="HELP_NEEDED">Help Needed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </FormErrorWrap>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Importance</p>
              <select
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full hover:scale-105 transition appearance-none"
                {...registerDetails("importance")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </FormErrorWrap>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Due Date</p>
              <DateTimePicker
                name="due_date"
                control={control}
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full"
              />
            </div>
          </FormErrorWrap>

          <div className="flex items-center justify-center gap-4 mt-4 w-full">
            <button
              type="submit"
              className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-105 duration-300 w-full"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Overlay>

      {/* Edit Photo Overlay */}
      <Overlay isOpen={isEditingPhoto} onClose={() => setIsEditingPhoto(false)}>
        <form
          onSubmit={handleSubmitPhoto(onSubmitPhoto)}
          className="flex flex-col gap-6 w-full"
        >
          <p className="text-4xl mb-10">Edit Task Photo</p>

          <FormErrorWrap>
            <div className="flex flex-col gap-4 items-center">
              {imageSrc && isBase64Image(imageSrc) && (
                <div className="relative w-64 h-64 mb-4">
                  <Image
                    src={imageSrc}
                    alt="Current Task Photo"
                    fill
                    className="object-contain"
                    unoptimized={isBase64Image(imageSrc)}
                  />
                </div>
              )}

              <label
                htmlFor="photo-upload"
                className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg cursor-pointer w-full hover:scale-105 transition text-center"
              >
                {isMultimedia ? "Change Photo" : "Upload Photo"}
              </label>

              <input
                id="photo-upload"
                type="file"
                accept="image/png, image/jpeg"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setPhotoValue("multimedia", base64);
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {imageSrc && isMultimedia && (
                <button
                  type="button"
                  onClick={() => setPhotoValue("multimedia", "")}
                  className="px-3 py-2 bg-ev-red text-white rounded-lg hover:scale-105 transition w-full"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </FormErrorWrap>

          <div className="flex items-center justify-center gap-4 mt-4 w-full">
            <button
              type="submit"
              className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-105 duration-300 w-full"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Overlay>
    </PageTemplate>
  );
}
