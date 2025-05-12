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

export default function WorkspaceDetails() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { User } = useUserContext();
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[] | null>(
    null,
  );
  const [tasks, setTasks] = useState<Task[] | null>(null);

  // Changed from useRouter to useSearchParams
  const searchParams = useSearchParams();
  const coverImage = searchParams.get("coverImage");
  const [receivedCoverImage, setReceivedCoverImage] = useState<string | null>(
    null,
  );

  type addWorkerFormProps = {
    invited_email: string | null;
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
          workspace_id: User.currentWorkspace?.id,
          inviter_email: User.authUser?.email,
          invited_email: data.invited_email,
        });
        console.log(res);
        toast.success(res.response);
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
              className="px-4 py-2 bg-ev-blue text-ev-white rounded-lg hover:scale-105 duration-300 disabled:opacity-50 w-full"
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
        User.currentWorkspace?.id.toString() ?? "-1",
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
        ApiLinks.listTasks(User.currentWorkspace?.id.toString() ?? "-1"),
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

      const tasks: Task[] = await res.json();
      setTasks(tasks);
      console.log("tasks:", tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (coverImage) {
      setReceivedCoverImage(coverImage);
    }
    getWorkers();
    getTasks();
  }, [coverImage]);

  return (
    <PageTemplate>
      <NavbarTemplate />
      <AddWorkerLogic />
      <Overlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <p className="text-4xl mb-10">Change Data</p>
        <div className="flex flex-col gap-6 w-full">
          {[
            { label: "Name", placeholder: "Electrician..." },
            { label: "Start Date", placeholder: "29/01/2025" },
            { label: "Due Date", placeholder: "25/08/2027" },
          ].map(({ label, placeholder }) => (
            <div
              key={label}
              className="flex justify-between items-center w-full"
            >
              <p className="text-xl">{label}:</p>
              <Input
                name={label.toLowerCase().replace(" ", "_")}
                type="text"
                placeholder={placeholder}
                className="px-3 py-2 bg-ev-gray text-ev-dark-gray rounded-lg"
              />
            </div>
          ))}
          <div className="flex justify-between items-center w-full">
            <p className="text-xl">Plan file:</p>
            <Input
              name="select_file"
              type="button"
              value="Select"
              className="px-4 py-2 bg-mc-blue text-white rounded-lg hover:scale-110 duration-300"
            />
          </div>
        </div>
      </Overlay>

      <section className="flex flex-row items-center justify-start h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <div className="flex w-full">
            <div className="flex flex-col w-3/4 mr-8 gap-8">
              <Image
                src={receivedCoverImage || "/problem.png"}
                alt="problem"
                width={1200}
                height={600}
                className="rounded-3xl w-full h-auto object-cover shadow-lg"
              />

              <div className="flex flex-col gap-2 p-6 bg-ev-primary-bg rounded-xl">
                <p className="text-3xl font-semibold mb-2">Workspace Details</p>
                <p>
                  Start Date: {User.currentWorkspace?.start_date?.toString()}
                </p>
                <p>
                  Due Date:{" "}
                  {User.currentWorkspace?.finish_date?.toString() ||
                    "Not yet established"}
                </p>
                <p>
                  Subscription Tier: {User.currentWorkspace?.ev_subscription}
                </p>
                <p>
                  Geolocation:{" "}
                  {User.currentWorkspace?.geolocation || "Not yet established"}
                </p>
                <p>Filename: {User.currentWorkspace?.plan_file_name}</p>
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
                  {tasks !== null ? (
                    <>
                      {tasks.map((task, i) => (
                        <TaskEntry
                          title={task.title}
                          status={task.status}
                          importance={task.importance}
                          key={i}
                        />
                      ))}
                    </>
                  ) : (
                    <p>Workspace doesn't have any tasks</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
