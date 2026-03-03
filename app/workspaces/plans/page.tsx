"use client";

import { useEffect, useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Image from "next/image";
import Overlay from "@/components/Overlay";
import Link from "next/link";
import useUserContext from "@/ev-contexts/userContextProvider";
import WorkerEntry from "@/components/WorkerEntry";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import { WorkspaceUser } from "@/ev-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import Regex from "@/ev-const/regex";
import toast from "react-hot-toast";
import { Task } from "@/ev-types/workspace-types";
import TaskEntry from "@/components/TaskEntry";
import { DateTimePicker } from "@/components/datepicker/Datepicker";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  ClipboardList,
  LayoutGrid,
  List,
  Upload,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function WorkspaceDetails() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskRemoval, setTaskRemoval] = useState(false);
  const [workerRemoval, setWorkerRemoval] = useState(false);
  const [selectedTasksIds, setSelectedTasksIds] = useState<number[]>([]);
  const [selectedWorkersIds, setSelectedWokrersIds] = useState<number[]>([]);
  const { User } = useUserContext();
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[] | null>(
    null,
  );
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const coverImage =
    User.workspaceData?.currentWorkspace?.coverPhoto || "/problem.png";
  const [receivedCoverImage, setReceivedCoverImage] = useState<string | null>(
    null,
  );
  const [showMapView, setShowMapView] = useState(true);
  const [workersExpanded, setWorkersExpanded] = useState(true);

  type addWorkerFormProps = { invited_email: string | null };
  type TaskFormProps = {
    title: string;
    description: string;
    assignee_email: string;
    importance: "LOW" | "MEDIUM" | "HIGH";
    category: string;
    due_date?: string;
    multimedia?: string;
  };

  const inputCls =
    "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all";

  /* ── Modals ── */
  const AddTaskLogic = () => {
    const { User } = useUserContext();
    const {
      handleSubmit,
      formState: { errors, isSubmitting },
      register,
      reset,
      setValue,
      control,
    } = useForm<TaskFormProps>({
      mode: "onTouched",
      reValidateMode: "onChange",
      defaultValues: { importance: "LOW", assignee_email: "" },
    });

    const onSubmit: SubmitHandler<TaskFormProps> = async (data) => {
      try {
        await OLF.post(
          ApiLinks.createTasks(
            User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          ),
          {
            assigner_email: User.authUser?.email,
            assignee_email: data.assignee_email,
            title: data.title,
            description: data.description,
            importance: data.importance,
            category: data.category,
            status: "TODO",
            due_date: data.due_date || null,
            description_multimedia: data.multimedia || null,
          },
        );
        toast.success("Task created!");
        setIsTaskOpen(false);
        reset();
        getTasks();
      } catch {
        toast.error("File too large");
      }
    };

    return (
      <Overlay isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)}>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <p className="text-xl font-bold text-slate-100">Create Task</p>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Title *
            </label>
            <input
              type="text"
              placeholder="Task title…"
              className={inputCls}
              {...register("title", {
                required: "Required",
                minLength: { value: 3, message: "Min 3 chars" },
              })}
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Description…"
              className={inputCls}
              {...register("description")}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Photo
            </label>
            <label
              htmlFor="multimedia-file"
              className="flex items-center gap-2 w-full cursor-pointer bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-ev-yellow/40 transition-all"
            >
              <Upload className="w-4 h-4" /> Upload Photo
            </label>
            <input
              id="multimedia-file"
              type="file"
              accept="image/png,image/jpeg"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onloadend = () =>
                  setValue("multimedia", r.result as string, {
                    shouldValidate: true,
                  });
                r.readAsDataURL(f);
              }}
            />
            <input type="hidden" {...register("multimedia")} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Assignee *
            </label>
            <div className="flex gap-2">
              <select
                className={`${inputCls} appearance-none flex-1`}
                {...register("assignee_email", { required: "Required" })}
              >
                <option value="" disabled>
                  Select…
                </option>
                {workspaceUsers?.map((u, i) => (
                  <option key={i} value={u.email}>
                    {u.email}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (User.authUser?.email)
                    setValue("assignee_email", User.authUser.email, {
                      shouldValidate: true,
                    });
                }}
                className="px-3 py-2 bg-[#1e293b] border border-[#334155] text-slate-300 rounded-xl text-xs hover:border-ev-yellow/40 transition-all whitespace-nowrap"
              >
                Me
              </button>
            </div>
            {errors.assignee_email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.assignee_email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Importance *
            </label>
            <select
              className={`${inputCls} appearance-none`}
              {...register("importance", { required: "Required" })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. Lamps"
              className={inputCls}
              {...register("category")}
            />
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
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating…" : "Create Task"}
          </button>
        </form>
      </Overlay>
    );
  };

  const AddWorkerLogic = () => {
    const {
      handleSubmit,
      formState: { errors, isSubmitting },
      register,
    } = useForm<addWorkerFormProps>({
      mode: "onTouched",
      reValidateMode: "onChange",
    });

    const onSubmit: SubmitHandler<addWorkerFormProps> = async (data) => {
      try {
        await OLF.post(ApiLinks.inviteWorker, {
          workspace_id: User.workspaceData?.currentWorkspace?.id,
          inviter_email: User.authUser?.email,
          invited_email: data.invited_email,
        });
        toast.success("Worker invited");
        setIsAddOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed", {
          duration: 5000,
        });
      }
    };

    return (
      <Overlay isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <p className="text-xl font-bold text-slate-100">Invite Worker</p>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Email
            </label>
            <input
              type="text"
              placeholder="worker@example.com"
              className={inputCls}
              {...register("invited_email", {
                validate: (v) =>
                  Regex.emailRegistration.test(v ?? "") || "Invalid email",
                required: "Required",
              })}
            />
            {errors.invited_email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.invited_email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Inviting…" : "Send Invite"}
          </button>
        </form>
      </Overlay>
    );
  };

  /* ── Data fetching ── */
  const removeTasks = async () => {
    if (!selectedTasksIds.length) return;
    try {
      await Promise.all(
        selectedTasksIds.map((id) =>
          OLF.delete(
            ApiLinks.removeTask(
              User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
              id.toString(),
            ),
          ),
        ),
      );
      toast.success("Tasks removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed", {
        duration: 5000,
      });
    }
    setTaskRemoval(false);
    setSelectedTasksIds([]);
    getTasks();
  };

  const removeWorkers = async () => {
    setWorkerRemoval(false);
    setSelectedWokrersIds([]);
  };

  const getWorkers = async () => {
    if (User.workspaceData?.currentWorkspace?.role !== "CREATOR") return;
    try {
      const res = await OLF.post(
        ApiLinks.listWorkspaceUsersByWorkspaceIdAndEmail(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
        ),
        { email: User.authUser?.email },
      );
      setWorkspaceUsers(res as WorkspaceUser[]);
    } catch (e) {
      console.error(e);
    }
  };

  const getTasks = async () => {
    try {
      const res = await fetch(
        ApiLinks.listTasks(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
        ),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner_email: User.authUser?.email }),
        },
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const resj = await res.json();
      setTasks(
        (resj["response"] as Task[]).filter((t) => t.task_type === "DEFAULT"),
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (coverImage)
      setReceivedCoverImage(typeof coverImage === "string" ? coverImage : null);
  }, [coverImage]);

  useEffect(() => {
    getWorkers();
    getTasks();
  }, []);

  const isCreator = User.workspaceData?.currentWorkspace?.role === "CREATOR";
  const ws = User.workspaceData?.currentWorkspace;

  /* ── Shared panel classes ── */
  const panelCls =
    "bg-[#1e293b] border border-[#334155] rounded-2xl flex flex-col overflow-hidden";
  const panelHeaderCls =
    "flex items-center justify-between px-4 py-3 border-b border-[#334155] flex-shrink-0";

  /* ── Reusable Workers panel ── */
  const WorkersPanel = ({ flex }: { flex?: string }) => (
    <div className={`${panelCls} ${flex ?? "flex-1 min-h-0"}`}>
      <div className={panelHeaderCls}>
        <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
          <Users className="w-4 h-4 text-ev-yellow" />
          Workers
          {workspaceUsers && workspaceUsers.length > 0 && (
            <span className="px-1.5 py-0.5 bg-ev-yellow/10 text-ev-yellow text-[10px] rounded-md">
              {workspaceUsers.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-lg hover:bg-ev-yellow/20 transition-all"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
          {!workerRemoval ? (
            <button
              onClick={() => setWorkerRemoval(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          ) : (
            <>
              <button
                onClick={() => setWorkerRemoval(false)}
                className="px-2.5 py-1.5 bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg hover:text-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={removeWorkers}
                className="px-2.5 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:brightness-110 transition-all"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {workspaceUsers && workspaceUsers.length > 0 ? (
          workspaceUsers.map((u, i) => (
            <WorkerEntry
              key={i}
              id={u.id}
              username={u.username}
              selectable={workerRemoval}
              setSelectedWorkersIds={setSelectedWokrersIds}
              selectedWorkersIds={selectedWorkersIds}
              workspaceUsers={workspaceUsers}
              role={u.workspace_role}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Users className="w-8 h-8 text-slate-600" />
            <p className="text-slate-500 text-sm">No workers yet</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ── Reusable Tasks panel ── */
  const TasksPanel = ({ flex }: { flex?: string }) => (
    <div className={`${panelCls} ${flex ?? "flex-1 min-h-0"}`}>
      <div className={panelHeaderCls}>
        <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
          <ClipboardList className="w-4 h-4 text-ev-yellow" />
          Tasks
          {tasks && tasks.length > 0 && (
            <span className="px-1.5 py-0.5 bg-ev-yellow/10 text-ev-yellow text-[10px] rounded-md">
              {tasks.length}
            </span>
          )}
        </div>
        {isCreator && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTaskOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-lg hover:bg-ev-yellow/20 transition-all"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
            {!taskRemoval ? (
              <button
                onClick={() => setTaskRemoval(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            ) : (
              <>
                <button
                  onClick={() => setTaskRemoval(false)}
                  className="px-2.5 py-1.5 bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg hover:text-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={removeTasks}
                  className="px-2.5 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:brightness-110 transition-all"
                >
                  Delete{" "}
                  {selectedTasksIds.length > 0 &&
                    `(${selectedTasksIds.length})`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {!tasks || tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <ClipboardList className="w-8 h-8 text-slate-600" />
            <p className="text-slate-500 text-sm">No tasks yet</p>
          </div>
        ) : (
          tasks.map((task, i) => (
            <TaskEntry
              key={i}
              task={task}
              workspaceUsers={workspaceUsers}
              selectable={taskRemoval}
              setSelectedTasksIds={setSelectedTasksIds}
              selectedTasksIds={selectedTasksIds}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <PageTemplate>
      <AddWorkerLogic />
      <AddTaskLogic />

      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-4 md:p-6 overflow-hidden">
            {/* ── toolbar ── */}
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-3 flex-shrink-0">
              <Link
                href="/workspaces"
                className="flex items-center gap-2 text-slate-400 hover:text-slate-100 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Workspaces</span>
              </Link>

              <div className="flex items-center gap-2">
                {/* workspace name pill */}
                {ws?.name && (
                  <span className="hidden md:block px-3 py-1.5 bg-[#1e293b] border border-[#334155] rounded-xl text-slate-300 text-xs font-medium truncate max-w-40">
                    {ws.name}
                  </span>
                )}
                <button
                  onClick={() => {
                    setShowMapView((p) => !p);
                    setTaskRemoval(false);
                    setWorkerRemoval(false);
                    setSelectedTasksIds([]);
                    setSelectedWokrersIds([]);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1e293b] border border-[#334155] text-slate-300 text-sm rounded-xl hover:border-[#475569] transition-all"
                >
                  {showMapView ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <LayoutGrid className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {showMapView ? "List View" : "Plan View"}
                  </span>
                </button>
              </div>
            </div>

            {showMapView ? (
              /* ── PLAN VIEW ── */
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Left: plan image + workspace details */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">
                  {/* plan image */}
                  <div className="relative">
                    <Link href="./plans/editor" className="block group">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white border border-[#334155]">
                        <Image
                          src={receivedCoverImage || "/problem.png"}
                          alt={ws?.name ?? "plan"}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          unoptimized={
                            typeof receivedCoverImage === "string" &&
                            (receivedCoverImage.startsWith("data:image/svg") ||
                              receivedCoverImage.includes(".svg"))
                          }
                        />
                        {/* overlay hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-[#0a0f1e]/80 rounded-xl text-ev-yellow text-sm font-medium">
                            <Pencil className="w-4 h-4" /> Open Editor
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* workspace info */}
                  {isCreator && (
                    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4">
                      <p className="text-sm font-semibold text-slate-100 mb-3">
                        Workspace Details
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {[
                          ["Name", ws?.name],
                          ["Start", ws?.start_date?.toString()],
                          ["Due", ws?.finish_date?.toString() || "Not set"],
                          ["Subscription", ws?.ev_subscription],
                          ["Geolocation", ws?.geolocation || "Not set"],
                          ["File", ws?.plan_file_name],
                        ].map(([k, v]) => (
                          <div key={k as string}>
                            <span className="text-slate-500">{k}</span>
                            <p className="text-slate-300 truncate mt-0.5">
                              {v}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: workers + tasks — fills container height on lg, full width stacked on mobile */}
                <div className="w-full lg:w-80 lg:flex-shrink-0 flex flex-col gap-4">
                  {isCreator ? (
                    <>
                      {/* workers — collapsible on mobile */}
                      <div className="flex flex-col min-h-0 lg:flex-1">
                        {/* mobile: collapsible header */}
                        <button
                          onClick={() => setWorkersExpanded((p) => !p)}
                          className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-t-2xl border-b-0 text-slate-100 text-sm font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-ev-yellow" />
                            Workers{" "}
                            {workspaceUsers?.length
                              ? `(${workspaceUsers.length})`
                              : ""}
                          </div>
                          {workersExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <div
                          className={`${workersExpanded ? "flex" : "hidden"} lg:flex flex-col min-h-0 flex-1`}
                        >
                          <WorkersPanel flex="flex-1 min-h-0 rounded-b-2xl lg:rounded-2xl lg:mb-1" />
                        </div>
                      </div>

                      {/* tasks */}
                      <TasksPanel flex="flex-1 min-h-0 rounded-2xl" />
                    </>
                  ) : (
                    /* non-creator: only tasks, full 50vh */
                    <TasksPanel flex="flex-1 min-h-0 rounded-2xl" />
                  )}
                </div>
              </div>
            ) : (
              /* ── LIST VIEW: workers + tasks side by side (or stacked mobile) ── */
              <div className="flex-1 min-h-0 flex flex-col sm:flex-row gap-4">
                {isCreator && <WorkersPanel flex="flex-1 min-h-0" />}
                <TasksPanel flex="flex-1 min-h-0" />
              </div>
            )}
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
