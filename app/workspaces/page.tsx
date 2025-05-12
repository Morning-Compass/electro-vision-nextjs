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
import { PythonReponse } from "@/ev-types/workspace-python-reponse-type";
import WorkspaceEntry from "@/components/WorkspaceEntry";
import toast from "react-hot-toast";

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

  if (!User.authUser?.id) {
    return (
      <PageTemplate>
        <NavbarTemplate />
        <div className="flex justify-center items-center h-screen">
          <p>Proszę się zalogować, aby zobaczyć przestrzenie robocze.</p>
        </div>
        <FooterSmall />
      </PageTemplate>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      const userId = User.authUser?.id;
      const userEmail = User.authUser?.email;

      if (!userId || !userEmail) {
        console.error("Brak ID użytkownika lub emaila w kontekście.");
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
        console.log("API Response for images:", imageMetadataResponse);

        const mergedWorkspaces = fetchedWorkspaces.map((workspace) => {
          const match = imageMetadataResponse?.files?.find(
            (file) => file.file_name === workspace.plan_file_name,
          );

          if (match && match.svg_content) {
            return { ...workspace, coverPhoto: match.svg_content };
          } else {
            if (match && !match.svg_content) {
              console.warn(
                `Znaleziono dopasowanie dla ${workspace.plan_file_name}, ale brak svg_content.`,
              );
            }
            return workspace;
          }
        });

        console.log("Merged Workspaces:", mergedWorkspaces);
        setWorkspaces(mergedWorkspaces);
      } catch (error) {
        console.error(
          "Nie udało się pobrać workspaces lub zdjęć okładek",
          error,
        );
        toast.error("Błąd podczas ładowania danych przestrzeni roboczych.");
        setWorkspaces([]);
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
      toast.error("Proszę wybrać plik obrazu.");
      console.error("No file selected.");
      return;
    }
    if (!workspaceName.trim()) {
      toast.error("Proszę wprowadzić nazwę przestrzeni roboczej.");
      console.error("Workspace name is empty.");
      return;
    }

    let userId = User.authUser?.id;
    if (!userId) {
      toast.error("Błąd: Brak ID użytkownika.");
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
      toast.success("Obrazek przesłany pomyślnie.");
    } catch (error) {
      console.error("Image Upload failed:", error);
      toast.error("Problem podczas przesyłania obrazka.");
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
        toast.success("Przestrzeń robocza dodana pomyślnie!");

        setIsOverlayOpen(false);
        setSelectedFile(null);
        setWorkspaceName("");
        setPreviewUrl(null);
      } catch (error_inner) {
        toast.error("Problem podczas tworzenia wpisu przestrzeni roboczej.");
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
          toast.info("Anulowano przesyłanie obrazka.");
        } catch (delete_error) {
          console.error(
            "Failed to remove uploaded image after workspace creation error:",
            delete_error,
          );
          toast.error(
            "Nie udało się usunąć obrazka po błędzie tworzenia workspace.",
          );
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
              Podgląd obrazu pojawi się tutaj
            </p>
          )}
        </div>

        <section className="flex flex-col sm:flex-row justify-between items-center w-full mb-4 gap-4">
          <p className="text-xl whitespace-nowrap">Wybierz obraz:</p>
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
              Wybierz plik (.svg)
            </label>
            {selectedFile && (
              <p
                className="text-sm text-gray-500 mt-1 truncate w-full text-right"
                title={selectedFile.name}
              >
                Wybrano: {selectedFile.name}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
          <label htmlFor="name_text" className="text-xl whitespace-nowrap">
            Nazwa:
          </label>
          <Input
            name="name_text"
            type="text"
            id="name_text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="text-ev-dark-gray bg-ev-primary-bg rounded-lg px-3 py-2 border-2 border-gray-300 focus:border-blue-500 outline-none w-full sm:w-auto flex-grow"
            placeholder="np. Hangar 1"
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
                  toast.error("Funkcja usuwania niezaimplementowana.")
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
                Brak dostępnych przestrzeni roboczych. Dodaj nową!
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
