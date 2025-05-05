"use client"

import { useState, useEffect, ChangeEvent } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import { FooterSmall } from "@/components/templates/FooterSmall";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import SearchButton from "@/components/SearchButton";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/Input";
import Overlay from "@/components/Overlay";

export default function EmployeesOverview() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");

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

  const handleAddWorkspace = () => {
    console.log("Adding workspace:", workspaceName, selectedFile);
    setIsOverlayOpen(false);
    setWorkspaceName("");
    setSelectedFile(null);
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
        <div className="relative w-96 h-64 mb-6 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-ev-gray">
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
            accept="image/*"
            id="file_input"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file_input"
            className="text-white text-center bg-mc-blue rounded-lg px-4 py-2 hover:scale-110 duration-300"
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
            className="text-ev-dark-gray bg-ev-gray rounded-lg px-3 py-2"
            placeholder="e.g. Hangar 1"
          />
        </section>

        <Input
          name="ok_button"
          type="button"
          className="mt-4 text-white bg-ev-green rounded-lg w-full h-12 hover:scale-110 duration-300"
          value="Add Workspace"
          onClick={handleAddWorkspace}
        />
      </Overlay>

      <section className="flex flex-row w-full mt-10">
        <SidebarTemplate activeIcon="map" />
        <ContentBlock>
          <section className="flex items-center justify-between mt-2 ml-6 mr-6">
            <h2 className="text-3xl font-semibold">Workspaces</h2>
            <section className="flex items-center gap-4">
              <SearchButton />
              <Input
                name="add"
                type="button"
                className="text-white bg-ev-green rounded-lg px-4 py-2 hover:scale-110 duration-300"
                value="Add"
                onClick={() => setIsOverlayOpen(true)}
              />
              <Input
                name="remove"
                type="button"
                className="text-white bg-ev-red rounded-lg px-4 py-2 hover:scale-110 duration-300"
                value="Remove"
              />
            </section>
          </section>
          <section className="flex flex-wrap justify-between p-6 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <section
                key={idx}
                className="flex flex-col items-center justify-center p-6 gap-5"
              >
                <Link href="/workspaces/plans">
                  <Image
                    src="/problem.png"
                    alt="Workspace"
                    width={480}
                    height={0}
                    className="w-[30rem] h-auto"
                  />
                </Link>
                <p className="text-xl">Hangar {idx + 1}</p>
              </section>
            ))}
          </section>
        </ContentBlock>
      </section>

      <FooterSmall />
    </PageTemplate>
  );
}
