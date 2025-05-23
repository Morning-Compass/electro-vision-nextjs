"use client";

import { useEffect, useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Image from "next/image";
import SearchButton from "@/components/SearchButton";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Changed from useRouter
import useUserContext from "@/ev-contexts/userContextProvider";
import WorkerEntry from "@/components/WorkerEntry";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import { WorkspaceUser } from "@/ev-types/user-types";
import { FormProps, SubmitHandler, useForm } from "react-hook-form";
import FormErrorWrap from "@/components/templates/FormErrorWrap";
import Regex from "@/ev-const/regex";
import toast from "react-hot-toast";
import { error } from "console";
import { Task } from "@/ev-types/workspace-types";
import TaskEntry from "@/components/TaskEntry";
import { DateTimePicker } from "@/components/datepicker/Datepicker";

export default function WorkspaceDetails() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [removal, setRemoval] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { User } = useUserContext();
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[] | null>(
    null,
  );
  const [tasks, setTasks] = useState<Task[] | null>(null);
  // Changed from useRouter to useSearchParams
  const searchParams = useSearchParams();
  const coverImage =
    User.workspaceData?.currentWorkspace?.coverPhoto || "/problem.png";
  const [receivedCoverImage, setReceivedCoverImage] = useState<string | null>(
    null,
  );
  const [showMapView, setShowMapView] = useState(true);

  type addWorkerFormProps = {
    invited_email: string | null;
  };

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
      control,
    } = useForm<TaskFormProps>({
      mode: "onTouched",
      reValidateMode: "onChange",
      defaultValues: {
        importance: "LOW",
      },
    });

    const onSubmit: SubmitHandler<TaskFormProps> = async (data) => {
      console.log(data);

      try {
        const taskPayload = {
          assigner_email: User.authUser?.email,
          assignee_email: data.assignee_email,
          title: data.title,
          description: data.description,
          importance: data.importance,
          category: data.category,
          status: "TODO",
          due_date: data.due_date || null,
          description_multimedia: data.multimedia || null,
        };

        const res = await OLF.post(
          ApiLinks.createTasks(
            User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
          ),
          taskPayload,
        );

        toast.success("Task created successfully!");
        console.log(res);
        setIsTaskOpen(false);
        reset();
        getTasks(); // Refresh the tasks list
      } catch (error) {
        console.error("Error creating task:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create task",
        );
      }
    };

    return (
      <>
        <Overlay isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)}>
          <form
            className="flex flex-col gap-6 w-full"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <p className="text-4xl mb-10">Create New Task</p>

            <FormErrorWrap>
              <div className="flex flex-col gap-4">
                <p className="text-xl">Title*</p>
                <Input
                  type="text"
                  placeholder="Task title..."
                  className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full"
                  error={errors.title?.message}
                  register={register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters",
                    },
                  })}
                />
              </div>
            </FormErrorWrap>

            <FormErrorWrap>
              <div className="flex flex-col gap-4">
                <p className="text-xl">Description</p>
                <Input
                  type="text"
                  placeholder="Task description..."
                  className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full"
                  error={errors.description?.message}
                  register={register("description")}
                />
              </div>
            </FormErrorWrap>

            <FormErrorWrap>
              <div className="flex flex-col gap-4">
                <p className="text-xl">Photo</p>

                <label
                  htmlFor="multimedia-file"
                  className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg cursor-pointer w-full hover:scale-105 transition text-left"
                >
                  Upload Photo
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
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setValue("multimedia", base64, { shouldValidate: true });
                    };
                    reader.readAsDataURL(file);
                  }}
                />

                <input type="hidden" {...register("multimedia")} />
              </div>
            </FormErrorWrap>

            <FormErrorWrap>
              <div className="flex flex-col gap-4">
                <p className="text-xl">Assignee Email*</p>
                <select
                  className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full hover:scale-105 transition appearance-none"
                  {...register("assignee_email", {
                    required: "Assignee is required",
                  })}
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
                <p className="text-xl">Importance*</p>
                <select
                  className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full hover:scale-105 transition appearance-none"
                  {...register("importance", {
                    required: "Importance is required",
                  })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {errors.importance && (
                  <p className="text-ev-red text-sm">
                    {errors.importance.message}
                  </p>
                )}
              </div>
            </FormErrorWrap>

            <FormErrorWrap>
              <div className="flex flex-col gap-4">
                <p className="text-xl">Category</p>
                <Input
                  type="text"
                  placeholder="e.g., Lamps, Sockets"
                  className="px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full"
                  error={errors.category?.message}
                  register={register("category")}
                />
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
              <Input
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-105 duration-300 disabled:opacity-50 w-full"
                value={isSubmitting ? "Creating..." : "Create Task"}
              />
            </div>
          </form>
        </Overlay>
      </>
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
        const res = await OLF.post(ApiLinks.inviteWorker, {
          workspace_id: User.workspaceData?.currentWorkspace?.id,
          inviter_email: User.authUser?.email,
          invited_email: data.invited_email,
        });
        console.log(res);
        toast.success("Worker invited successfully");
        setIsAddOpen(false);
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Adding worker failed", {
          duration: 5000,
        });
      }
    };

    return (
      <Overlay isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form
          className="flex flex-col gap-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <p className="text-4xl mb-10">Add Worker</p>

          <FormErrorWrap>
            <div className="flex flex-col gap-4">
              <p className="text-xl">Invited Email</p>
              <Input
                type="text"
                placeholder="email..."
                className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg w-full"
                error={errors.invited_email?.message}
                register={register("invited_email", {
                  validate: (cred) => {
                    const regexResult = Regex.emailRegistration.test(
                      cred ?? "",
                    );
                    if (!regexResult) return "Email must be correct";
                    return true;
                  },
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                })}
              />
            </div>
          </FormErrorWrap>

          <div className="flex items-center justify-center  gap-4 mt-4 w-full">
            <Input
              customWidth="w-1/2"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-ev-blue text-ev-white rounded-lg hover:scale-105 duration-300 disabled:opacity-50 w-full text-center flex items-center justify-center"
              value={isSubmitting ? "Adding..." : "Add Worker"}
            />
          </div>
        </form>
      </Overlay>
    );
  };

  const getWorkers = async () => {
    const res = await OLF.post(
      ApiLinks.listWorkspaceUsersByWorkspaceIdAndEmail(
        User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
      ),
      {
        email: User.authUser?.email,
      },
    );
    console.log(res);
    const workers: WorkspaceUser[] = res;
    setWorkspaceUsers(workers);
  };

  const getTasks = async () => {
    try {
      const res = await fetch(
        ApiLinks.listTasks(
          User.workspaceData?.currentWorkspace?.id.toString() ?? "-1",
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner_email: User.authUser?.email,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const resj = await res.json();
      const tasks: Task[] = resj["response"];
      setTasks(tasks);
      console.log("tasks:", tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (coverImage) {
      setReceivedCoverImage(typeof coverImage === "string" ? coverImage : null);
    }
    getWorkers();
    getTasks();
  }, [coverImage]);

  useEffect(() => {
    const interval = setInterval(() => {
      getWorkers();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageTemplate>
      <NavbarTemplate />
      <AddWorkerLogic />
      <AddTaskLogic />

      <section className="flex flex-row items-center justify-start h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <div className="flex flex-row items-center justify-between mb-8 ml-8 mr-8 ">
            <Link
              href="/workspaces/"
              className="text-ev-accent-text hover:text-ev-accent-text/80 text-lg font-medium flex items-center transition-colors duration-200"
            >
              ← Back
            </Link>
            <Input
              name="toggle_view"
              type="button"
              className="text-white bg-ev-blue rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 whitespace-nowrap w-[6vw] min-w-12"
              value="Toggle View"
              onClick={() => setShowMapView((prev) => !prev)}
            />
          </div>
          {showMapView ? (
            <div className="flex w-full">
              <div className="flex flex-col w-3/4 mr-8 gap-8">
                <Link href={"./plans/editor"}>
                  <Image
                    src={receivedCoverImage || "/problem.png"}
                    alt="problem"
                    width={1200}
                    height={600}
                    className="rounded-3xl w-full h-auto object-cover shadow-lg p-6 bg-ev-white"
                  />
                </Link>

                <div className="flex flex-col gap-2 p-6 bg-ev-primary-bg rounded-xl">
                  <p className="text-3xl font-semibold mb-2">
                    Workspace Details
                  </p>
                  <p>
                    Start Date:{" "}
                    {User.workspaceData?.currentWorkspace?.start_date?.toString()}
                  </p>
                  <p>
                    Due Date:{" "}
                    {User.workspaceData?.currentWorkspace?.finish_date?.toString() ||
                      "Not yet established"}
                  </p>
                  <p>
                    Subscription Tier:{" "}
                    {User.workspaceData?.currentWorkspace?.ev_subscription}
                  </p>
                  <p>
                    Geolocation:{" "}
                    {User.workspaceData?.currentWorkspace?.geolocation ||
                      "Not yet established"}
                  </p>
                  <p>
                    Filename:{" "}
                    {User.workspaceData?.currentWorkspace?.plan_file_name}
                  </p>
                  <Input
                    name="settings"
                    type="button"
                    value="Settings"
                    onClick={() => setIsSettingsOpen(true)}
                    className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-105 duration-300 w-[80%] p-2 m-4"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-8 w-1/4">
                <div className=" p-6 bg-ev-primary-bg overflow-y-scroll rounded-xl h-1/2">
                  <div className="flex justify-between items-center mb-10 border-b-4 gap-4 pb-4">
                    <p className="text-2xl">Workers</p>
                    <SearchButton customWidth="w-full" />
                  </div>
                  <div className="flex justify-around mb-10 items-center">
                    <Input
                      name="add"
                      type="button"
                      value="Add"
                      onClick={() => setIsAddOpen(true)}
                      customWidth="w-3/4"
                      className="px-4 py-2 bg-ev-green text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                    />
                    <Input
                      name="remove"
                      type="button"
                      value="Remove"
                      customWidth="w-3/4"
                      className="px-4 py-2 bg-ev-red text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                    />
                  </div>
                  <div className="flex flex-col gap-4 mb-10 w-full">
                    {workspaceUsers !== null ? (
                      <>
                        {workspaceUsers.map((workspaceUser, i) => (
                          <WorkerEntry
                            id={workspaceUser.id}
                            username={workspaceUser.username}
                            key={i}
                          />
                        ))}
                      </>
                    ) : (
                      <p>Workspace doesn't have any users</p>
                    )}
                  </div>
                </div>

                <div className=" p-6 bg-ev-primary-bg overflow-y-scroll rounded-xl h-1/2">
                  <div className="flex justify-between items-center mb-10 border-b-4 gap-4 pb-4">
                    <p className="text-2xl">Tasks</p>
                    <SearchButton customWidth="w-full" />
                  </div>
                  <div className="flex justify-around mb-10 items-center">
                    <Input
                      name="add_task"
                      type="button"
                      value="Add"
                      onClick={() => setIsTaskOpen(true)}
                      customWidth="w-3/4"
                      className="px-4 py-2 bg-ev-green text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                    />
                    <Input
                      name="remove"
                      type="button"
                      value="Remove"
                      customWidth="w-3/4"
                      className="px-4 py-2 bg-ev-red text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                    />
                  </div>
                  <div className="flex flex-col gap-4 mb-10 w-full">
                    {tasks === null ||
                    tasks === undefined ||
                    tasks.length === 0 ? (
                      <p>Workspace doesn't have any tasks</p>
                    ) : (
                      <>
                        {workspaceUsers &&
                          tasks.map((task, i) => (
                            <TaskEntry
                              task={task}
                              key={i}
                              workspaceUsers={workspaceUsers}
                            />
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-row gap-8 w-full overflow-y-hidden">
              <div className=" p-6 bg-ev-primary-bg overflow-y-scroll rounded-xl h-full w-full">
                <div className="flex justify-between items-center mb-10 border-b-4 gap-4 pb-4">
                  <p className="text-2xl">Workers</p>
                  <SearchButton customWidth="w-full" />
                </div>
                <div className="flex justify-around mb-10 items-center">
                  <Input
                    name="add"
                    type="button"
                    value="Add"
                    onClick={() => setIsAddOpen(true)}
                    customWidth="w-3/4"
                    className="px-4 py-2 bg-ev-green text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                  />
                  <Input
                    name="remove"
                    type="button"
                    value="Remove"
                    customWidth="w-3/4"
                    className="px-4 py-2 bg-ev-red text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                  />
                </div>
                <div className="flex flex-col gap-4 mb-10 w-full">
                  {workspaceUsers !== null ? (
                    <>
                      {workspaceUsers.map((workspaceUser, i) => (
                        <WorkerEntry
                          id={workspaceUser.id}
                          username={workspaceUser.username}
                          key={i}
                          selectable={!removal}
                        />
                      ))}
                    </>
                  ) : (
                    <p>Workspace doesn't have any users</p>
                  )}
                </div>
              </div>

              <div className=" p-6 bg-ev-primary-bg overflow-y-scroll rounded-xl h-full w-full">
                <div className="flex justify-between items-center mb-10 border-b-4 gap-4 pb-4">
                  <p className="text-2xl">Tasks</p>
                  <SearchButton customWidth="w-full" />
                </div>
                <div className="flex justify-around mb-10 items-center">
                  <Input
                    name="add_task"
                    type="button"
                    value="Add"
                    onClick={() => setIsTaskOpen(true)}
                    customWidth="w-3/4"
                    className="px-4 py-2 bg-ev-green text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                  />
                  <Input
                    name="remove"
                    type="button"
                    value="Remove"
                    onClick={() => setRemoval(true)}
                    customWidth="w-3/4"
                    className="px-4 py-2 bg-ev-red text-white rounded-lg hover:scale-110 duration-300 w-3/4"
                  />
                </div>
                <div className="flex flex-col gap-4 mb-10 w-full">
                  {tasks === null ||
                  tasks === undefined ||
                  tasks.length === 0 ? (
                    <p>Workspace doesn't have any tasks</p>
                  ) : (
                    <>
                      {workspaceUsers &&
                        tasks.map((task, i) => (
                          <TaskEntry
                            task={task}
                            key={i}
                            workspaceUsers={workspaceUsers}
                          />
                        ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
