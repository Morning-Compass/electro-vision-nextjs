"use client";

import { useEffect, useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Image from "next/image";
import Input from "@/components/Input";
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
} from "lucide-react";

export default function WorkspaceDetails() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskRemoval, setTaskRemoval] = useState(false);
  const [workerRemoval, setWorkerRemoval] = useState(false);
  const [selectedTasksIds, setSelectedTasksIds] = useState<number[]>([]);
  const [selectedWorkersIds, setSelectedWokrersIds] = useState<number[]>([]);
  const { User } = useUserContext();
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const coverImage = User.workspaceData?.currentWorkspace?.coverPhoto || "/problem.png";
  const [receivedCoverImage, setReceivedCoverImage] = useState<string | null>(null);
  const [showMapView, setShowMapView] = useState(true);

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

  const AddTaskLogic = () => {
    const { User } = useUserContext();
    const {
      handleSubmit,
      formState: { errors, isSubmitting },
      register,
      reset,
      setValue,
      watch,
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
        toast.success("Task created successfully!");
        setIsTaskOpen(false);
        reset();
        getTasks();
      } catch {
        toast.error("File too large");
      }
    };

    const inputCls =
      "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all";

    return (
      <Overlay isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)}>
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <p className="text-2xl font-bold text-slate-100 mb-2">Create Task</p>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Title *</label>
            <input
              type="text"
              placeholder="Task title..."
              className={inputCls}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Min 3 characters" },
              })}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </FormErrorWrap>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Description</label>
            <input type="text" placeholder="Task description..." className={inputCls} {...register("description")} />
          </FormErrorWrap>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Photo</label>
            <label
              htmlFor="multimedia-file"
              className="flex items-center gap-2 w-full cursor-pointer bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-ev-yellow/40 hover:text-slate-100 transition-all"
            >
              <Plus className="w-4 h-4" /> Upload Photo
            </label>
            <input
              id="multimedia-file"
              type="file"
              accept="image/png, image/jpeg"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setValue("multimedia", reader.result as string, { shouldValidate: true });
                reader.readAsDataURL(file);
              }}
            />
            <input type="hidden" {...register("multimedia")} />
          </FormErrorWrap>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Assignee *</label>
            <div className="flex gap-2">
              <select
                className={`${inputCls} appearance-none flex-1`}
                {...register("assignee_email", { required: "Assignee is required" })}
              >
                <option value="" disabled>Select assignee...</option>
                {workspaceUsers?.map((u, i) => (
                  <option key={i} value={u.email}>{u.email}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => { if (User.authUser?.email) setValue("assignee_email", User.authUser.email, { shouldValidate: true }); }}
                className="px-3 py-2 bg-[#1e293b] border border-[#334155] text-slate-300 rounded-xl text-sm hover:border-ev-yellow/40 transition-all whitespace-nowrap"
              >
                Assign me
              </button>
            </div>
            {errors.assignee_email && <p className="text-xs text-red-400">{errors.assignee_email.message}</p>}
          </FormErrorWrap>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Importance *</label>
            <select className={`${inputCls} appearance-none`} {...register("importance", { required: "Required" })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </FormErrorWrap>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Category</label>
            <input type="text" placeholder="e.g. Lamps, Sockets" className={inputCls} {...register("category")} />
          </FormErrorWrap>

          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Due Date</label>
            <DateTimePicker name="due_date" control={control} className={inputCls} />
          </FormErrorWrap>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
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
    } = useForm<addWorkerFormProps>({ mode: "onTouched", reValidateMode: "onChange" });

    const onSubmit: SubmitHandler<addWorkerFormProps> = async (data) => {
      try {
        await OLF.post(ApiLinks.inviteWorker, {
          workspace_id: User.workspaceData?.currentWorkspace?.id,
          inviter_email: User.authUser?.email,
          invited_email: data.invited_email,
        });
        toast.success("Worker invited successfully");
        setIsAddOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Adding worker failed", { duration: 5000 });
      }
    };

    const inputCls =
      "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all";

    return (
      <Overlay isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="text-2xl font-bold text-slate-100 mb-2">Invite Worker</p>
          <FormErrorWrap>
            <label className="text-sm font-medium text-slate-400">Email</label>
            <input
              type="text"
              placeholder="worker@example.com"
              className={inputCls}
              {...register("invited_email", {
                validate: (v) => Regex.emailRegistration.test(v ?? "") || "Enter a valid email",
                required: "Email is required",
              })}
            />
            {errors.invited_email && <p className="text-xs text-red-400">{errors.invited_email.message}</p>}
          </FormErrorWrap>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Inviting..." : "Send Invite"}
          </button>
        </form>
      </Overlay>
    );
  };

  const removeTasks = async () => {
    if (selectedTasksIds.length <= 0) return;
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
      toast.success("Tasks removed successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Remove failed", { duration: 5000 });
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
        ApiLinks.listTasks(User.workspaceData?.currentWorkspace?.id.toString() ?? "-1"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner_email: User.authUser?.email }),
        },
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const resj = await res.json();
      const allTasks: Task[] = resj["response"];
      setTasks(allTasks.filter((t) => t.task_type === "DEFAULT"));
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (coverImage) setReceivedCoverImage(typeof coverImage === "string" ? coverImage : null);
  }, [coverImage]);

  useEffect(() => { getWorkers(); getTasks(); }, []);

  const isCreator = User.workspaceData?.currentWorkspace?.role === "CREATOR";

  const panelCls = "bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col gap-4";
  const panelHeaderCls = "flex items-center justify-between pb-3 border-b border-[#334155]";

  return (
    <PageTemplate>
      <AddWorkerLogic />
      <AddTaskLogic />

      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-6">

            {/* ── toolbar ── */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/workspaces"
                className="flex items-center gap-2 text-slate-400 hover:text-slate-100 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Workspaces
              </Link>
              <button
                onClick={() => {
                  setShowMapView((p) => !p);
                  setTaskRemoval(false);
                  setWorkerRemoval(false);
                  setSelectedTasksIds([]);
                  setSelectedWokrersIds([]);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] text-slate-300 text-sm rounded-xl hover:border-[#475569] transition-all"
              >
                {showMapView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                {showMapView ? "List View" : "Plan View"}
              </button>
            </div>

            {showMapView ? (
              /* ── plan view: image left, panels right ── */
              <div className="flex gap-6 items-start">
                {/* left — plan image + workspace info */}
                <div className="flex-1 flex flex-col gap-5 min-w-0">
                  <Link href="./plans/editor" className="block">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white border border-[#334155]">
                      <Image
                        src={receivedCoverImage || "/problem.png"}
                        alt={User.workspaceData?.currentWorkspace?.name ?? "plan"}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1200px) 100vw, 60vw"
                        unoptimized={
                          typeof receivedCoverImage === "string" &&
                          (receivedCoverImage.startsWith("data:image/svg") || receivedCoverImage.includes(".svg"))
                        }
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 text-center">Click to open editor</p>
                  </Link>

                  {isCreator && (
                    <div className={panelCls}>
                      <p className="text-base font-semibold text-slate-100">Workspace Details</p>
                      <div className="flex flex-col gap-2 text-sm text-slate-400">
                        <p><span className="text-slate-500">Name:</span> {User.workspaceData?.currentWorkspace?.name}</p>
                        <p><span className="text-slate-500">Start:</span> {User.workspaceData?.currentWorkspace?.start_date?.toString()}</p>
                        <p><span className="text-slate-500">Due:</span> {User.workspaceData?.currentWorkspace?.finish_date?.toString() || "Not set"}</p>
                        <p><span className="text-slate-500">Subscription:</span> {User.workspaceData?.currentWorkspace?.ev_subscription}</p>
                        <p><span className="text-slate-500">Geolocation:</span> {User.workspaceData?.currentWorkspace?.geolocation || "Not set"}</p>
                        <p><span className="text-slate-500">File:</span> {User.workspaceData?.currentWorkspace?.plan_file_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* right — workers + tasks */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-5">
                  {/* workers */}
                  {isCreator && (
                    <div className={panelCls}>
                      <div className={panelHeaderCls}>
                        <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
                          <Users className="w-4 h-4 text-ev-yellow" />
                          Workers
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsAddOpen(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-lg hover:bg-ev-yellow/20 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                          {!workerRemoval ? (
                            <button
                              onClick={() => setWorkerRemoval(true)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          ) : (
                            <>
                              <button onClick={() => setWorkerRemoval(false)} className="px-3 py-1.5 bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg hover:text-slate-100 transition-all">Cancel</button>
                              <button onClick={removeWorkers} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:brightness-110 transition-all">Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
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
                          <p className="text-slate-500 text-sm">No workers yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* tasks */}
                  <div className={panelCls}>
                    <div className={panelHeaderCls}>
                      <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
                        <ClipboardList className="w-4 h-4 text-ev-yellow" />
                        Tasks
                        {tasks && tasks.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-md">
                            {tasks.length}
                          </span>
                        )}
                      </div>
                      {isCreator && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsTaskOpen(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-lg hover:bg-ev-yellow/20 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                          {!taskRemoval ? (
                            <button
                              onClick={() => setTaskRemoval(true)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          ) : (
                            <>
                              <button onClick={() => setTaskRemoval(false)} className="px-3 py-1.5 bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg hover:text-slate-100 transition-all">Cancel</button>
                              <button onClick={removeTasks} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:brightness-110 transition-all">Delete ({selectedTasksIds.length})</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      {tasks === null || tasks.length === 0 ? (
                        <p className="text-slate-500 text-sm">No tasks yet</p>
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
                </div>
              </div>
            ) : (
              /* ── list view: workers + tasks side by side ── */
              <div className="flex gap-6">
                {isCreator && (
                  <div className={`${panelCls} flex-1`}>
                    <div className={panelHeaderCls}>
                      <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
                        <Users className="w-4 h-4 text-ev-yellow" /> Workers
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-lg hover:bg-ev-yellow/20 transition-all">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                        {!workerRemoval ? (
                          <button onClick={() => setWorkerRemoval(true)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        ) : (
                          <>
                            <button onClick={() => setWorkerRemoval(false)} className="px-3 py-1.5 bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg hover:text-slate-100 transition-all">Cancel</button>
                            <button onClick={removeWorkers} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:brightness-110 transition-all">Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
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
                        <p className="text-slate-500 text-sm">No workers yet</p>
                      )}
                    </div>
                  </div>
                )}

                <div className={`${panelCls} flex-1`}>
                  <div className={panelHeaderCls}>
                    <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
                      <ClipboardList className="w-4 h-4 text-ev-yellow" />
                      Tasks
                      {tasks && tasks.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-md">{tasks.length}</span>
                      )}
                    </div>
                    {isCreator && (
                      <div className="flex gap-2">
                        <button onClick={() => setIsTaskOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-ev-yellow/10 text-ev-yellow text-xs rounded-lg hover:bg-ev-yellow/20 transition-all">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                        {!taskRemoval ? (
                          <button onClick={() => setTaskRemoval(true)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        ) : (
                          <>
                            <button onClick={() => setTaskRemoval(false)} className="px-3 py-1.5 bg-[#0f172a] border border-[#334155] text-slate-400 text-xs rounded-lg hover:text-slate-100 transition-all">Cancel</button>
                            <button onClick={removeTasks} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:brightness-110 transition-all">Delete ({selectedTasksIds.length})</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    {tasks === null || tasks.length === 0 ? (
                      <p className="text-slate-500 text-sm">No tasks yet</p>
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
              </div>
            )}
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
