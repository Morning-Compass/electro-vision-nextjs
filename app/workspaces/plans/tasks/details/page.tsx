"use client";

import ContentBlock from "@/components/ContentBlock";
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
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import toast from "react-hot-toast";
import { DateTimePicker } from "@/components/datepicker/Datepicker";
import { Upload } from "lucide-react";

const formatDate = (date: string | Date | null): string => {
  if (!date) return "Not Defined";
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

type EditDescriptionForm = { description: string };
type EditTaskDetailsForm = {
  assignee_email: string;
  title: string;
  status: "HELP_NEEDED" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  importance: "LOW" | "MEDIUM" | "HIGH";
  due_date: string;
  category: string;
};
type EditPhotoForm = { multimedia: string };

const inputCls =
  "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all";
const selectCls =
  "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all appearance-none";
const cardCls = "bg-[#1e293b] border border-[#334155] rounded-2xl p-5";

export default function Page() {
  const { User, UserDispatch } = useUserContext();

  const multimedia = User.workspaceData?.currentTask?.description_multimedia;
  const task = User.workspaceData?.currentTask;
  const creator = User.workspaceData?.currentWorkspace?.role === "CREATOR";

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  const workspaceUsers = User.workspaceData?.users;

  const isMultimedia =
    task?.description_multimedia !== "" &&
    task?.description_multimedia !== null &&
    task?.description_multimedia !== undefined;

  const { register: registerDesc, handleSubmit: handleSubmitDesc } =
    useForm<EditDescriptionForm>({
      defaultValues: { description: task?.description || "" },
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
    setValue: setPhotoValue,
    watch: watchPhoto,
    handleSubmit: handleSubmitPhoto,
  } = useForm<EditPhotoForm>({
    defaultValues: { multimedia: multimedia || "" },
  });

  const imageSrc =
    watchPhoto("multimedia") ||
    (multimedia && isBase64Image(multimedia) ? multimedia : "/tasks.svg");

  const onSubmitDescription = async (data: EditDescriptionForm) => {
    try {
      setIsEditingDescription(false);
      await OLF.put(
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update task",
      );
    }
  };

  const onSubmitDetails = async (data: EditTaskDetailsForm) => {
    try {
      setIsEditingDetails(false);
      const dueDateISO = data.due_date
        ? new Date(data.due_date).toISOString().split(".")[0]
        : null;

      await OLF.put(
        ApiLinks.updateTask(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          User.workspaceData?.currentTask?.id.toString() ?? "-1",
        ),
        {
          assigner_email: null,
          assignee_email: data.assignee_email,
          description: null,
          due_date: dueDateISO,
          status: data.status,
          title: data.title,
          importance: data.importance,
          category: data.category,
          description_multimedia: null,
        },
      );
      toast.success("Task details updated successfully");
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update task",
      );
    }
  };

  const onSubmitPhoto = async (data: EditPhotoForm) => {
    try {
      setIsEditingPhoto(false);
      await OLF.put(
        ApiLinks.updateTask(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          User.workspaceData?.currentTask?.id.toString() ?? "-1",
        ),
        {
          assigner_email: null,
          assignee_email: null,
          description: null,
          due_date: null,
          status: null,
          title: null,
          importance: null,
          category: null,
          description_multimedia: data.multimedia,
        },
      );
      toast.success("Task photo updated successfully");
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update photo",
      );
    }
  };

  const importanceBadge = (importance?: string) => {
    const map: Record<string, string> = {
      LOW: "bg-green-500/20 text-green-400",
      MEDIUM: "bg-yellow-500/20 text-yellow-400",
      HIGH: "bg-red-500/20 text-red-400",
    };
    return map[importance ?? ""] ?? "bg-slate-500/20 text-slate-400";
  };

  return (
    <PageTemplate>
      {/* Edit Description Overlay */}
      <Overlay
        isOpen={isEditingDescription}
        onClose={() => setIsEditingDescription(false)}
      >
        <form
          onSubmit={handleSubmitDesc(onSubmitDescription)}
          className="flex flex-col gap-4 w-full"
        >
          <p className="text-xl font-bold text-slate-100">Edit Description</p>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Description
            </label>
            <textarea
              {...registerDesc("description")}
              placeholder="Task description..."
              className={`${inputCls} h-48 resize-none`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-ev-yellow text-black font-semibold rounded-xl hover:bg-ev-yellow/90 transition-colors text-sm"
          >
            Save Changes
          </button>
        </form>
      </Overlay>

      {/* Edit Details Overlay */}
      <Overlay
        isOpen={isEditingDetails}
        onClose={() => setIsEditingDetails(false)}
      >
        <form
          onSubmit={handleSubmitDetails(onSubmitDetails)}
          className="flex flex-col gap-4 w-full"
        >
          <p className="text-xl font-bold text-slate-100">Edit Task Details</p>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="New title..."
              defaultValue={task?.title}
              className={inputCls}
              {...registerDetails("title")}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Assignee
            </label>
            <select className={selectCls} {...registerDetails("assignee_email")}>
              {workspaceUsers?.map((u, i) => (
                <option key={i} value={u.email}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Category
            </label>
            <input
              type="text"
              placeholder="Category"
              className={inputCls}
              {...registerDetails("category")}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Status
            </label>
            <select className={selectCls} {...registerDetails("status")}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="HELP_NEEDED">Help Needed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Importance
            </label>
            <select className={selectCls} {...registerDetails("importance")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Due Date
            </label>
            <DateTimePicker
              name="due_date"
              control={control}
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-ev-yellow text-black font-semibold rounded-xl hover:bg-ev-yellow/90 transition-colors text-sm"
          >
            Save Changes
          </button>
        </form>
      </Overlay>

      {/* Edit Photo Overlay */}
      <Overlay isOpen={isEditingPhoto} onClose={() => setIsEditingPhoto(false)}>
        <form
          onSubmit={handleSubmitPhoto(onSubmitPhoto)}
          className="flex flex-col gap-4 w-full"
        >
          <p className="text-xl font-bold text-slate-100">Edit Task Photo</p>

          <div className="flex flex-col gap-4 items-center">
            {imageSrc && isBase64Image(imageSrc) && (
              <div className="relative w-64 h-64">
                <Image
                  src={imageSrc}
                  alt="Current Task Photo"
                  fill
                  className="object-contain rounded-xl"
                  unoptimized={isBase64Image(imageSrc)}
                />
              </div>
            )}

            <label
              htmlFor="photo-upload"
              className="flex items-center gap-2 w-full cursor-pointer bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-ev-yellow/40 transition-all justify-center"
            >
              <Upload className="w-4 h-4" />
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
                  setPhotoValue("multimedia", reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />

            {imageSrc && isMultimedia && (
              <button
                type="button"
                onClick={() => setPhotoValue("multimedia", "")}
                className="w-full py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors"
              >
                Remove Photo
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-ev-yellow text-black font-semibold rounded-xl hover:bg-ev-yellow/90 transition-colors text-sm"
          >
            Save Changes
          </button>
        </form>
      </Overlay>

      {/* Main layout */}
      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-4 md:p-6">
            {/* Back link */}
            <div className="mb-4">
              <Link
                href="/workspaces/plans"
                className="text-ev-yellow text-sm hover:underline"
              >
                ← Back to Workspace
              </Link>
            </div>

            {/* Task title */}
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              {task?.title ?? "Untitled Task"}
            </h2>

            {/* Two-column grid: description + photo left, details right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Description card */}
              <div className={cardCls}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Description
                  </h3>
                  {creator && (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="text-xs text-ev-yellow hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {task?.description || "Description has not been set."}
                </p>
              </div>

              {/* Details card */}
              <div className={cardCls}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Details
                  </h3>
                  <div className="flex items-center gap-3">
                    {creator && !isMultimedia && (
                      <button
                        onClick={() => setIsEditingPhoto(true)}
                        className="text-xs text-ev-yellow hover:underline"
                      >
                        Add Photo
                      </button>
                    )}
                    {creator && (
                      <button
                        onClick={() => setIsEditingDetails(true)}
                        className="text-xs text-ev-yellow hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <dl className="flex flex-col gap-2.5">
                  {[
                    ["Assigner", task?.assigner_email],
                    ["Assignee", task?.assignee_email],
                    [
                      "Status",
                      task?.status?.replaceAll("_", " "),
                    ],
                    [
                      "Created",
                      task?.created_at ? formatDate(task.created_at) : "Unknown",
                    ],
                    [
                      "Due",
                      task?.due_date
                        ? formatDate(task.due_date)
                        : "Not Defined",
                    ],
                    ["Category", isMultimedia ? task?.category : "Not Defined"],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-slate-500 text-xs">{label}</dt>
                      <dd className="text-slate-300 text-sm font-medium mt-0.5">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-slate-500 text-xs">Importance</dt>
                    <dd className="mt-0.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${importanceBadge(task?.importance)}`}
                      >
                        {task?.importance ?? "—"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Photo card (if exists) */}
            {isBase64Image(imageSrc) && (
              <div className={`${cardCls} mb-4`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Photo
                  </h3>
                  {creator && (
                    <button
                      onClick={() => setIsEditingPhoto(true)}
                      className="text-xs text-ev-yellow hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="relative w-full h-64">
                  <Image
                    src={imageSrc}
                    alt="Task"
                    fill
                    className="object-contain rounded-xl"
                    unoptimized={isBase64Image(imageSrc)}
                  />
                </div>
              </div>
            )}

            {/* Map placeholder */}
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">Map</h3>
              <div className="flex items-center justify-center h-48 bg-[#0f172a] rounded-xl text-slate-500 text-sm">
                Map preview coming soon
              </div>
            </div>
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
