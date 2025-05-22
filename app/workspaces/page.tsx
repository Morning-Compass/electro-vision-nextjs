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
import { getFilePreview, revokeObjectUrl } from "@/ev-lib/fileUtils";

export default function Workspaces() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const { User } = useUserContext();
  const [coverImagesData, setCoverImagesData] = useState<PythonReponse | null>(
    null,
  );
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const loadingMessages = [
    "Preparing your space...",
    "Uploading blueprints...",
    "Setting up dimensions...",
    "Almost there...",
    "Final touches...",
  ];

  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(
    loadingMessages[0],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCreatingWorkspace) {
      let counter = 0;
      interval = setInterval(() => {
        counter = (counter + 1) % loadingMessages.length;
        setCurrentLoadingMessage(loadingMessages[counter]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCreatingWorkspace]);

  if (!User.authUser?.id) {
    return (
      <PageTemplate>
        <NavbarTemplate />
        <div className="flex justify-center items-center h-screen">
          <p>Please log in to view workspaces.</p>
        </div>
        <FooterSmall />
      </PageTemplate>
    );
  }
  const fetchData = async () => {
    const userId = User.authUser?.id;
    const userEmail = User.authUser?.email;

    if (!userId || !userEmail) {
      console.error("Missing user ID or email in context.");
      setWorkspaces([]);
      return;
    }

    setWorkspaces(null);

    try {
      const fetchedWorkspaces: Workspace[] = await OLF.post(
        ApiLinks.listWorkspaces,
        { email: userEmail },
      );

      const imageMetadataResponse: PythonReponse = await OLF.get(
        `${ApiLinks.retrieveFiles}/${userId}`,
      );

      setCoverImagesData(imageMetadataResponse);
      console.log(fetchedWorkspaces);

      const mergedWorkspaces = await Promise.all(
        fetchedWorkspaces.map(async (workspace) => {
          try {
            if (!workspace.plan_file_name) return workspace;

            const baseFilename = workspace.plan_file_name.replace(
              /\.pdf$/i,
              "",
            );
            const match = imageMetadataResponse?.files?.find(
              (file) =>
                file.storage_path.includes(baseFilename) ||
                file.file_name.includes(baseFilename),
            );

            if (match && match.svg_content) {
              try {
                const coverPhoto = await getFilePreview(match.svg_content);
                return { ...workspace, coverPhoto };
              } catch (svgError) {
                console.error("Error processing SVG content:", svgError);
                return workspace;
              }
            }

            console.warn(
              `No SVG match found for workspace file: ${workspace.plan_file_name}`,
            );
            return workspace;
          } catch (error) {
            console.error("Error processing workspace:", error);
            return workspace;
          }
        }),
      );

      console.log(mergedWorkspaces);
      setWorkspaces(mergedWorkspaces);
    } catch (error) {
      console.error("Failed to fetch workspaces or cover images", error);
      toast.error("Error loading workspace data.");
      setWorkspaces([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [User.authUser?.id, User.authUser?.email]);

  useEffect(() => {
    const handlePreview = async () => {
      if (!selectedFile) {
        setPreviewUrl(null);
        return;
      }

      const preview = await getFilePreview(selectedFile);
      setPreviewUrl(preview);
    };

    handlePreview();

    return () => {
      if (previewUrl) {
        revokeObjectUrl(previewUrl);
      }
    };
  }, [selectedFile]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddWorkspace = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file.");
      console.error("No file selected.");
      return;
    }
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name.");
      console.error("Workspace name is empty.");
      return;
    }

    let userId = User.authUser?.id;
    if (!userId) {
      toast.error("Error: Missing user ID.");
      return;
    }
    const userIdStr = userId.toString();

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", userIdStr);

    let imageUploadedSuccessfully = false;
    try {
      console.log("Uploading image via Python backend...");
      const uploadResponse = await OLF.post(ApiLinks.uploadImage, formData);
      console.log("Image Upload response:", uploadResponse);
      imageUploadedSuccessfully = true;
      toast.success("Image uploaded successfully.");
    } catch (error) {
      console.error("Image Upload failed:", error);
      toast.error("Problem uploading image.");
      return;
    }

    if (imageUploadedSuccessfully) {
      console.log("Creating workspace via Rust backend...");
      try {
        const workspacePayload = {
          owner_email: User.authUser?.email ?? "",
          geolocation: null,
          name: workspaceName,
          plan_file_name: selectedFile.name,
          finish_date: null,
        };
        console.log("Sending workspace payload:", workspacePayload);
        const response_workspace = await OLF.post(
          ApiLinks.createWorkspace,
          workspacePayload,
        );
        console.log("Rust created workspace response:", response_workspace);
        toast.success("Workspace added successfully!");

        await fetchData();

        setIsOverlayOpen(false);
        setSelectedFile(null);
        setWorkspaceName("");
        setPreviewUrl(null);
      } catch (error_inner) {
        toast.error("Problem creating workspace entry.");
        console.error("Workspace Creation failed:", error_inner);

        console.log(
          "Attempting to remove uploaded image due to workspace creation failure...",
        );
        try {
          await OLF.delete(
            `${ApiLinks.removeFile}/${userIdStr}/${selectedFile.name}`,
            {},
          );
          console.log(`Successfully removed image: ${selectedFile.name}`);
          toast.error("Image upload canceled.");
        } catch (delete_error) {
          console.error(
            "Failed to remove uploaded image after workspace creation error:",
            delete_error,
          );
          toast.error("Failed to remove image after workspace creation error.");
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
              Preview will be shown here
            </p>
          )}
        </div>

        <section className="flex flex-col sm:flex-row justify-start items-center w-full mb-4 gap-4">
          <p className="text-xl whitespace-nowrap">Choose file</p>
          <div className="flex flex-col items-end w-full sm:w-auto">
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
              className="cursor-pointer text-ev-white text-center bg-ev-blue rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 w-full sm:w-auto"
            >
              Choose file (.svg or .pdf)
            </label>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row justify-start items-center w-full mb-4 gap-4">
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-1 w-full text-left break-all whitespace-normal">
              Selected: {selectedFile.name}
            </p>
          )}
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
            placeholder="e.g., Hangar 1"
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

      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="flex flex-col sm:flex-row items-center justify-between mt-4 mb-6 ml-6 mr-6 gap-4">
            <h2 className="text-3xl font-semibold">Workspaces</h2>
            <section className="flex items-center gap-2 sm:gap-4">
              <SearchButton />
              <Input
                name="add"
                type="button"
                className="text-white bg-ev-green rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 whitespace-nowrap w-[6vw] min-w-12"
                value="Add"
                onClick={() => setIsOverlayOpen(true)}
              />
              <Input
                name="remove"
                type="button"
                className="text-white bg-ev-red rounded-lg px-4 py-2 hover:scale-105 active:scale-95 duration-200 whitespace-nowrap w-[6vw] min-w-12 "
                value="Remove"
                onClick={() =>
                  toast.error("Delete functionality not implemented.")
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
