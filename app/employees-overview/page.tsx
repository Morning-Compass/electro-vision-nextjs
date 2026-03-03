"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Link from "next/link";
import { useState } from "react";
import { Search, Plus, UserCircle, ChevronRight } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  role: string;
  department: string;
  date: string;
  status: "Work from office" | "Absent" | "Late arrival" | "Work from home";
  profilePicture?: string;
};

const DEMO_EMPLOYEES: Employee[] = [
  { id: 2341421, name: "Ahmed Rashdan", role: "Help Desk Executive", department: "IT Department", date: "19 Apr 2025", status: "Work from office", profilePicture: "/employee.png" },
  { id: 2341422, name: "Ahmed Rashdan", role: "Help Desk Executive", department: "IT Department", date: "19 Apr 2025", status: "Absent" },
  { id: 2341423, name: "Ahmed Rashdan", role: "Help Desk Executive", department: "IT Department", date: "19 Apr 2025", status: "Late arrival" },
  { id: 2341424, name: "Ahmed Rashdan", role: "Help Desk Executive", department: "IT Department", date: "19 Apr 2025", status: "Work from home" },
];

const STATUS_STYLES: Record<Employee["status"], string> = {
  "Work from office": "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  "Absent": "bg-red-500/15 text-red-400 border border-red-500/30",
  "Late arrival": "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  "Work from home": "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-ev-yellow/20 flex items-center justify-center flex-shrink-0">
      <span className="text-ev-yellow text-xs font-semibold">{initials}</span>
    </div>
  );
}

export default function EmployeesOverview() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTemplate>
      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-6">
            {/* ── toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Employees</h2>
                <p className="text-slate-400 text-sm">{filtered.length} records found</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-56 bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-2 pl-9 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all"
                  />
                </div>

                {/* add employee */}
                <Link
                  href="/employees-overview/add"
                  className="flex items-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold text-sm px-4 py-2 rounded-xl hover:brightness-110 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </Link>
              </div>
            </div>

            {/* ── table ── */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
              {/* header */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-[#334155] text-xs font-medium text-slate-500 uppercase tracking-wider">
                <span className="w-8" />
                <span>Employee</span>
                <span className="hidden md:block">Role</span>
                <span className="hidden lg:block">Department</span>
                <span className="hidden sm:block">Date</span>
                <span>Status</span>
              </div>

              {/* rows */}
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <UserCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No employees found</p>
                  </div>
                </div>
              ) : (
                filtered.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-4 px-5 py-4 border-b border-[#334155] last:border-0 items-center hover:bg-[#253047] transition-colors group"
                  >
                    {/* avatar */}
                    <InitialsAvatar name={emp.name} />

                    {/* name + id */}
                    <div className="min-w-0">
                      <p className="text-slate-100 text-sm font-medium truncate">{emp.name}</p>
                      <p className="text-slate-500 text-xs">#{emp.id}</p>
                    </div>

                    {/* role */}
                    <p className="hidden md:block text-slate-400 text-sm truncate">{emp.role}</p>

                    {/* department */}
                    <p className="hidden lg:block text-slate-400 text-sm truncate">{emp.department}</p>

                    {/* date */}
                    <p className="hidden sm:block text-slate-500 text-xs whitespace-nowrap">{emp.date}</p>

                    {/* status + action */}
                    <div className="flex items-center gap-3">
                      <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${STATUS_STYLES[emp.status]}`}>
                        {emp.status}
                      </span>
                      <Link
                        href={{
                          pathname: "/employees-overview/details",
                          query: { id: emp.id, employee: emp.name, role: emp.role, department: emp.department },
                        }}
                        className="w-8 h-8 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-center text-slate-500 hover:text-ev-yellow hover:border-ev-yellow/40 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── pagination ── */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
              <span>Page 1 of 100</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-ev-yellow/40 hover:text-slate-100 transition-all disabled:opacity-40" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-ev-yellow/40 hover:text-slate-100 transition-all">
                  Next
                </button>
              </div>
            </div>
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
