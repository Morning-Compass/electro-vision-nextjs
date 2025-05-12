"use client";

import { useState, useEffect, ChangeEvent, useLayoutEffect } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import Image from "next/image";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import useUserContext from "@/ev-contexts/userContextProvider";
import { Workspace } from "@/ev-types/workspace-types";
import WorkspaceEntry from "@/components/WorkspaceEntry";

export default function Workspaces() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const { User } = useUserContext();
  const [coverImages, setCoverImages] = useState<string[] | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);

  if (!User.authUser?.id || User.authUser.id === null) {
    return (
      <PageTemplate>
        <></>
      </PageTemplate>
    );
  }

  const getWorkspaces = async () => {
    console.log("getting workspaces...");
    const res = await OLF.post(ApiLinks.listWorkspaces, {
      email: User.authUser?.email,
    });

    const workspaces: Workspace[] = res;
    setWorkspaces(workspaces);
  };

  const getWorkspacesCoverPhotos = async () => {
    const userId = User.authUser?.id;

    if (!userId || userId === null) {
      console.error("Invalid user ID");
      return;
    }

    try {
      const response = await OLF.get(`${ApiLinks.retrieveFiles}/${userId}`);
      console.log(response);
      const fileNames: string[] = response?.data?.file_names;
      console.log("Filenames:", fileNames);

      if (!fileNames || !workspaces) return;
    } catch (error) {
      console.error("Failed to get workspace cover photos:", error);
    }
  };

  useEffect(() => {
    getWorkspaces();
  }, []);
  console.log(workspaces);
  useEffect(() => {
    if (workspaces) {
      getWorkspacesCoverPhotos();
    }
  }, [workspaces]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddWorkspace = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    let userId = User.authUser?.id;
    if (!userId) {
      userId = "-1";
    }
    userId = userId.toString();

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", userId);

    try {
      const response = await OLF.post(ApiLinks.uploadImage, formData);
      console.log("Upload response:", response);
      setIsOverlayOpen(false);
      setSelectedFile(null);
      try {
        console.log({
          owner_email: User.authUser?.email ?? "tomek@el-jot.eu",
          geolocation: null,
          name: workspaceName ?? "workspace_name",
          plan_file_name: selectedFile.name ?? "file_name.svg",
          finish_date: null,
        });

        const response_workspace = await OLF.post(ApiLinks.createWorkspace, {
          owner_email: User.authUser?.email ?? "tomek@el-jot.eu",
          geolocation: null,
          name: workspaceName ?? "workspace_name",
          plan_file_name: selectedFile.name ?? "file_name.svg",
          finish_date: null,
        });
        console.log(response_workspace);
      } catch (error_inner) {
        console.error("Workspace Creation failed:", error_inner);
        await OLF.delete(
          `${ApiLinks.removeFile}/${userId}/${selectedFile.name}`,
          {},
        );
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <PageTemplate>
      <NavbarTemplate />

      <Overlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        blockClassName="max-w-lg"
      >
        <p className="text-4xl mb-8">Add Workspace</p>

        {/* Image placeholder or preview */}
        <div className="relative w-96 h-64 mb-6 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-ev-primary-bg">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          ) : (
            <p className="text-ev-dark-gray absolute inset-0 flex items-center justify-center">
              Image preview will appear here
            </p>
          )}
        </div>

        {/* File input trigger */}
        <section className="flex flex-row justify-between items-center w-full mb-4">
          <p className="text-xl">Select Image:</p>
          <Input
            name="file_input"
            type="file"
            accept=".svg,.pdf"
            id="file_input"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file_input"
            className="text-ev-white text-center bg-ev-blue rounded-lg px-4 py-2 hover:scale-110 duration-300"
          >
            Choose Image
          </label>
        </section>

        {/* Workspace name */}
        <section className="flex flex-row justify-between items-center w-full mb-6">
          <label htmlFor="name_text" className="text-xl">
            Name:
          </label>
          <Input
            name="name_text"
            type="text"
            id="name_text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="text-ev-dark-gray bg-ev-primary-bg rounded-lg px-3 py-2 border-2 border-blue-500"
            placeholder="e.g. Hangar 1"
          />
        </section>

        <Input
          name="ok_button"
          type="button"
          className="mt-4 text-white bg-ev-green rounded-lg w-full h-12 hover:scale-110 duration-300 px-4"
          value="Add Workspace"
          onClick={handleAddWorkspace}
        />
      </Overlay>

      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="flex items-center justify-between mt-2 ml-6 mr-6">
            <h2 className="text-3xl font-semibold">Workspaces</h2>
            <section className="flex items-center gap-4">
              <SearchButton />
              <Input
                name="add"
                type="button"
                className="text-white bg-ev-green rounded-lg px-4 py-2 hover:scale-110 duration-300 w-[6vw]"
                value="Add"
                onClick={() => setIsOverlayOpen(true)}
              />
              <Input
                name="remove"
                type="button"
                className="text-white bg-ev-red rounded-lg px-4 py-2 hover:scale-110 duration-300 w-[6vw]"
                value="Remove"
              />
            </section>
          </section>
          <section className="flex flex-wrap justify-between p-6 gap-5">
            {workspaces === null ? (
              <div>No workspaces aviable</div>
            ) : (
              <>
                {workspaces.map((workspace) => (
                  <WorkspaceEntry workspace={workspace} />
                ))}
              </>
            )}
          </section>
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
