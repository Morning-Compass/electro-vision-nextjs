"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Image from "next/image";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import useUserContext from "@/ev-contexts/userContextProvider";
import { Workspace } from "@/ev-types/workspace-types";
import { PythonReponse } from "@/ev-types/workspace-python-reponse-type";
import WorkspaceEntry from "@/components/WorkspaceEntry";
import toast from "react-hot-toast";
import { getFilePreview, revokeObjectUrl } from "@/ev-lib/fileUtils";
import { Plus, Trash2, Upload, X, Loader2, Building2 } from "lucide-react";

export default function Workspaces() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const { User } = useUserContext();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<number[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const loadingMessages = [
    "Preparing your space...",
    "Uploading blueprints...",
    "Setting up dimensions...",
    "Almost there...",
    "Final touches...",
  ];
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);

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

  const fetchData = async () => {
    const userId = User.authUser?.id;
    const userEmail = User.authUser?.email;
    if (!userId || !userEmail) {
      setWorkspaces([]);
      return;
    }
    setWorkspaces(null);
    try {
      const fetchedWorkspaces: Workspace[] = await OLF.post(
        ApiLinks.listWorkspaces,
        { email: userEmail },
        undefined,
        User.authUser?.token ?? ""
      );
      if (!fetchedWorkspaces || fetchedWorkspaces.length === 0) {
        setWorkspaces([]);
        return;
      }
      const imageMetadataResponse: PythonReponse = await OLF.get(
        `${ApiLinks.retrieveFiles}/${fetchedWorkspaces[0].owner_id}`,
        undefined,
        User.authUser?.token ?? ""
      );
      const mergedWorkspaces = await Promise.all(
        fetchedWorkspaces.map(async (workspace) => {
          try {
            if (!workspace.plan_file_name) return workspace;
            const baseFilename = workspace.plan_file_name.replace(/\.pdf$/i, "");
            const match = imageMetadataResponse?.files?.find(
              (file) =>
                file.storage_path.includes(baseFilename) ||
                file.file_name.includes(baseFilename)
            );
            if (match && match.svg_content) {
              try {
                const coverPhoto = await getFilePreview(match.svg_content);
                return { ...workspace, coverPhoto };
              } catch {
                return workspace;
              }
            }
            return workspace;
          } catch {
            return workspace;
          }
        })
      );
      setWorkspaces(mergedWorkspaces);
    } catch (error) {
      console.error("Failed to fetch workspaces", error);
      toast.error("Error loading workspace data.");
      setWorkspaces([]);
    }
  };

  useEffect(() => {
    if (User.authUser?.id) fetchData();
  }, [User.authUser?.id, User.authUser?.email]);

  useEffect(() => {
    const handlePreview = async () => {
      if (!selectedFile) { setPreviewUrl(null); return; }
      const preview = await getFilePreview(selectedFile);
      setPreviewUrl(preview);
    };
    handlePreview();
    return () => { if (previewUrl) revokeObjectUrl(previewUrl); };
  }, [selectedFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddWorkspace = async () => {
    if (!selectedFile) { toast.error("Please select a file."); return; }
    if (!workspaceName.trim()) { toast.error("Please enter a workspace name."); return; }
    const userId = User.authUser?.id;
    if (!userId) { toast.error("Missing user ID."); return; }
    const userIdStr = userId.toString();

    setIsCreatingWorkspace(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", userIdStr);

    try {
      await OLF.post(ApiLinks.uploadImage, formData, undefined, User.authUser?.token ?? "");
      toast.success("Image uploaded successfully.");
    } catch (error) {
      console.error("Image Upload failed:", error);
      toast.error("Problem uploading image.");
      setIsCreatingWorkspace(false);
      return;
    }

    try {
      await OLF.post(
        ApiLinks.createWorkspace,
        {
          owner_email: User.authUser?.email ?? "",
          geolocation: null,
          name: workspaceName,
          plan_file_name: selectedFile.name,
          finish_date: null,
        },
        undefined,
        User.authUser?.token ?? ""
      );
      toast.success("Workspace added successfully!");
      await fetchData();
      setIsAddOpen(false);
      setSelectedFile(null);
      setWorkspaceName("");
      setPreviewUrl(null);
    } catch (error) {
      toast.error("Problem creating workspace entry.");
      try {
        await OLF.delete(
          `${ApiLinks.removeFile}/${userIdStr}/${selectedFile.name}`,
          {},
          undefined,
          User.authUser?.token ?? ""
        );
      } catch {
        toast.error("Failed to remove image after workspace creation error.");
      }
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedWorkspaceIds.map((id) =>
          OLF.delete(
            ApiLinks.removeWorkspace(id.toString()),
            undefined,
            undefined,
            User.authUser?.token ?? ""
          )
        )
      );
      toast.success("Workspaces deleted successfully");
      setSelectedWorkspaceIds([]);
      await fetchData();
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete workspaces");
    }
  };

  return (
    <PageTemplate>
      {/* ── Add Workspace Modal ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-100 font-semibold text-lg">Add Workspace</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#0f172a] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* preview */}
            <div className="relative w-full aspect-video mb-5 border border-dashed border-[#334155] rounded-xl overflow-hidden bg-[#0f172a] flex items-center justify-center">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
              ) : (
                <div className="text-center text-slate-500 text-sm">
                  <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  Preview will appear here
                </div>
              )}
            </div>

            {/* file picker */}
            <div className="mb-4">
              <input
                type="file"
                accept=".svg,.pdf"
                id="file_input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file_input"
                className="flex items-center justify-center gap-2 w-full cursor-pointer bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:border-ev-yellow/40 hover:text-slate-100 transition-all"
              >
                <Upload className="w-4 h-4" />
                {selectedFile ? selectedFile.name : "Choose file (.svg or .pdf)"}
              </label>
            </div>

            {/* name input */}
            <div className="mb-6">
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., Hangar 1"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-2.5 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all"
              />
            </div>

            <button
              onClick={handleAddWorkspace}
              disabled={!selectedFile || !workspaceName.trim() || isCreatingWorkspace}
              className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingWorkspace ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {currentLoadingMessage}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Workspace
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-slate-100 font-semibold text-lg mb-1">Confirm Deletion</h3>
              <p className="text-slate-400 text-sm">
                Are you sure you want to delete {selectedWorkspaceIds.length} selected workspace
                {selectedWorkspaceIds.length > 1 ? "s" : ""}? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#334155] text-slate-400 text-sm font-medium hover:border-[#475569] hover:text-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:brightness-110 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-6">
            {/* ── toolbar ── */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Workspaces</h2>
                <p className="text-slate-400 text-sm">
                  {workspaces !== null ? `${workspaces.length} workspaces` : "Loading..."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedWorkspaceIds.length > 0 && (
                  <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-2 border border-red-500/40 text-red-400 text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedWorkspaceIds.length})
                  </button>
                )}
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold text-sm px-4 py-2 rounded-xl hover:brightness-110 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Workspace
                </button>
              </div>
            </div>

            {/* ── workspace grid ── */}
            {workspaces === null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-[#0f172a] animate-pulse" />
                    <div className="p-4">
                      <div className="h-4 bg-[#0f172a] rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {workspaces !== null && workspaces.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1e293b] border border-[#334155] flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-slate-300 font-medium">No workspaces yet</p>
                  <p className="text-slate-500 text-sm mt-1">Add your first workspace to get started</p>
                </div>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold text-sm px-5 py-2.5 rounded-xl hover:brightness-110 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Workspace
                </button>
              </div>
            )}

            {workspaces !== null && workspaces.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {workspaces.map((workspace) => (
                  <WorkspaceEntry
                    key={workspace.id}
                    workspace={workspace}
                    setLoading={setIsLoading}
                    isSelected={selectedWorkspaceIds.includes(workspace.id)}
                    onToggleSelect={(workspaceId, isChecked) => {
                      setSelectedWorkspaceIds((prev) =>
                        isChecked
                          ? [...prev, workspaceId]
                          : prev.filter((id) => id !== workspaceId)
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
