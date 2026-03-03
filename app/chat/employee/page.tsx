"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Link from "next/link";

function ChatEmployeeContent() {
  const searchParams = useSearchParams();

  const id: number = parseInt(searchParams.get("id") ?? "0");
  const employee: string = searchParams.get("employee") ?? "employee";
  const role: string = searchParams.get("role") ?? "role";
  const department: string = searchParams.get("department") ?? "department";

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarTemplate />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarTemplate />
        <ContentBlock blockClassName="p-6">
          <div className="mb-4">
            <Link href="/chat" className="text-ev-yellow text-sm hover:underline">← Back to Chat</Link>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs">ID</p>
                <p className="text-slate-100 font-medium mt-1">{id}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Employee</p>
                <p className="text-slate-100 font-medium mt-1">{employee}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Role</p>
                <p className="text-slate-100 font-medium mt-1">{role}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Department</p>
                <p className="text-slate-100 font-medium mt-1">{department}</p>
              </div>
            </div>
          </div>
        </ContentBlock>
      </div>
    </div>
  );
}

export default function ChatEmployee() {
  return (
    <PageTemplate>
      <Suspense fallback={null}>
        <ChatEmployeeContent />
      </Suspense>
    </PageTemplate>
  );
}
