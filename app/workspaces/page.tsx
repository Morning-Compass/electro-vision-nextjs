"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
import { PythonReponse } from "@/ev-types/workspace-python-reponse-type";
import WorkspaceEntry from "@/components/WorkspaceEntry";
import toast from "react-hot-toast";

export default function Workspaces() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const { User } = useUserContext();
  const [coverImages, setCoverImages] = useState<PythonReponse | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);

  if (!User.authUser?.id) {
    return (
      <PageTemplate>
        <></>
      </PageTemplate>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      const userId = User.authUser?.id;
      const userEmail = User.authUser?.email;

      if (!userId || !userEmail) return;

      try {
        // 1. Get workspaces
        const fetchedWorkspaces: Workspace[] = await OLF.post(
          ApiLinks.listWorkspaces,
          {
            email: userEmail,
          },
        );

        // 2. Get cover image metadata
        const response: PythonReponse = await OLF.get(
          `${ApiLinks.retrieveFiles}/${userId}`,
        );
        setCoverImages(response);

        // 3. Merge cover photos into workspaces
        const mergedWorkspaces = fetchedWorkspaces.map((workspace) => {
          const match = response?.files?.find(
            (file) => file.file_name === workspace.plan_file_name,
          );
          return {
            ...workspace,
            coverPhoto: match?.svg_content,
          };
        });

        setWorkspaces(mergedWorkspaces);
      } catch (error) {
        console.error("Failed to fetch workspaces or cover photos", error);
        toast.error("Error loading workspace data");
      }
    };

    fetchData();
  }, [User.authUser?.id, User.authUser?.email]);

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
      toast.error("Please select an image file");
      return;
    }
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    const userId = User.authUser?.id?.toString();
    if (!userId) {
      toast.error("Error: Missing user ID");
      return;
    }

    // Upload image to Python backend
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", userId);

    try {
      await OLF.post(ApiLinks.uploadImage, formData);

      // Create workspace in Rust backend
      const workspacePayload = {
        owner_email: User.authUser?.email ?? "",
        geolocation: null,
        name: workspaceName,
        plan_file_name: selectedFile.name,
        finish_date: null,
      };

      await OLF.post(ApiLinks.createWorkspace, workspacePayload);

      toast.success("Workspace added successfully!");
      setIsOverlayOpen(false);
      setSelectedFile(null);
      setWorkspaceName("");
      setPreviewUrl(null);

      // Refresh workspaces list
      const fetchedWorkspaces: Workspace[] = await OLF.post(
        ApiLinks.listWorkspaces,
        {
          email: User.authUser?.email ?? "",
        },
      );
      setWorkspaces(fetchedWorkspaces);
    } catch (error) {
      console.error("Error adding workspace:", error);
      toast.error("Problem while adding workspace");

      // Attempt to remove uploaded file if workspace creation failed
      if (userId && selectedFile) {
        try {
          await OLF.delete(
            `${ApiLinks.removeFile}/${userId}/${selectedFile.name}`,
            {},
          );
        } catch (deleteError) {
          console.error("Failed to remove uploaded image:", deleteError);
        }
      }
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

        <div className="relative w-full max-w-md h-64 mb-6 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-ev-primary-bg flex items-center justify-center">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          ) : (
            <p className="text-ev-dark-gray text-center p-4">
              Image preview will appear here
            </p>
          )}
        </div>

        <section className="flex flex-col sm:flex-row justify-between items-center w-full mb-4 gap-4">
          <p className="text-xl whitespace-nowrap">Select image:</p>
          <div className="flex flex-col items-end w-full sm:w-auto">
            <Input
              name="file_input"
              type="file"
              accept=".svg"
              id="file_input"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file_input"
              className="cursor-pointer text-ev-white text-center bg-ev-blue rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 w-full sm:w-auto"
            >
              Choose file (.svg)
            </label>
            {selectedFile && (
              <p
                className="text-sm text-gray-500 mt-1 truncate w-full text-right"
                title={selectedFile.name}
              >
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
          <label htmlFor="name_text" className="text-xl whitespace-nowrap">
            Name:
          </label>
          <Input
            name="name_text"
            type="text"
            id="name_text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="text-ev-dark-gray bg-ev-primary-bg rounded-lg px-3 py-2 border-2 border-gray-300 focus:border-blue-500 outline-none w-full sm:w-auto flex-grow"
            placeholder="e.g. Hangar 1"
            required
          />
        </section>

        <Input
          name="ok_button"
          type="button"
          className="mt-4 text-white bg-ev-green rounded-lg w-full h-12 hover:scale-105 active:scale-95 duration-200 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          value="Add Workspace"
          onClick={handleAddWorkspace}
          disabled={!selectedFile || !workspaceName.trim()}
        />
      </Overlay>

      <section className="flex flex-row items-start h-full gap-8 w-full px-4 sm:px-8 md:px-12">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="flex flex-col sm:flex-row items-center justify-between mt-4 mb-6 ml-6 mr-6 gap-4">
            <h2 className="text-3xl font-semibold">Workspaces</h2>
            <section className="flex items-center gap-2 sm:gap-4">
              <SearchButton />
              <Input
                name="add"
                type="button"
                className="text-white bg-ev-green rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 whitespace-nowrap"
                value="Add"
                onClick={() => setIsOverlayOpen(true)}
              />
              <Input
                name="remove"
                type="button"
                className="text-white bg-ev-red rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 whitespace-nowrap"
                value="Remove"
                onClick={() =>
                  toast.error("Remove functionality not implemented")
                }
              />
            </section>
          </section>

          <section className="p-6">
            {workspaces === null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-xl aspect-video animate-pulse"
                  />
                ))}
              </div>
            )}

            {workspaces !== null && workspaces.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-2xl text-center text-gray-500 py-10">
                No workspaces available. Add a new one!
              </div>
            )}

            {workspaces !== null && workspaces.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                {workspaces.map((workspace) => (
                  <WorkspaceEntry key={workspace.id} workspace={workspace} />
                ))}
              </div>
            )}
          </section>
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
