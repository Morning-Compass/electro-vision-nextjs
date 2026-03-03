"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Link from "next/link";
import { UserCircle } from "lucide-react";

function EmployeeDetailsContent() {
  const searchParams = useSearchParams();

  const id: number = parseInt(searchParams.get("id") ?? "0");
  const employee: string = searchParams.get("employee") ?? "Unknown";
  const role: string = searchParams.get("role") ?? "—";
  const department: string = searchParams.get("department") ?? "—";

  const initials = employee.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarTemplate />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarTemplate />
        <ContentBlock blockClassName="p-6">
          <div className="mb-5">
            <Link href="/employees-overview" className="text-ev-yellow text-sm hover:underline">← Back to Employees</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* avatar card */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-ev-yellow/20 flex items-center justify-center">
                <span className="text-ev-yellow text-2xl font-bold">{initials}</span>
              </div>
              <div className="text-center">
                <h2 className="text-slate-100 font-semibold text-lg">{employee}</h2>
                <p className="text-slate-400 text-sm mt-1">{role}</p>
                <p className="text-slate-500 text-xs mt-0.5">{department}</p>
              </div>
            </div>

            {/* personal info */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
              <h3 className="text-slate-100 font-semibold text-sm mb-4">Personal Information</h3>
              <dl className="flex flex-col gap-3">
                {[
                  ["Birth Date", "15 Jan 1990"],
                  ["Country", "Saudi Arabia"],
                  ["Education", "Secondary"],
                  ["Phone", "+966 011 999 3343"],
                  ["Email", "ahmed.rashdan@mail.com"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-500 text-xs">{label}</dt>
                    <dd className="text-slate-300 text-sm font-medium mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* company info */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
              <h3 className="text-slate-100 font-semibold text-sm mb-4">Company Information</h3>
              <dl className="flex flex-col gap-3">
                {[
                  ["Worker ID", String(id)],
                  ["Working Since", "1 Jan 2015"],
                  ["Position", "Electrician"],
                  ["Hours/Week", "40"],
                  ["Sex", "Male"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-500 text-xs">{label}</dt>
                    <dd className="text-slate-300 text-sm font-medium mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </ContentBlock>
      </div>
    </div>
  );
}

export default function EmployeesOverviewDetails() {
  return (
    <PageTemplate>
      <Suspense fallback={null}>
        <EmployeeDetailsContent />
      </Suspense>
    </PageTemplate>
  );
}
