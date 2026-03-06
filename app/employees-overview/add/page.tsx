"use client";

import PageTemplate from "@/components/templates/PageTemplate";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import Link from "next/link";

const cardCls = "bg-[#1e293b] border border-[#334155] rounded-2xl p-6";
const inputCls =
  "w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all";

export default function EmployeesOverview() {
  return (
    <PageTemplate>
      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-4 md:p-6">
            {/* Back link */}
            <div className="mb-5">
              <Link
                href="/employees-overview"
                className="text-ev-yellow text-sm hover:underline"
              >
                ← Back to Employees
              </Link>
            </div>

            <div className={`${cardCls} max-w-2xl`}>
              <h2 className="text-slate-100 font-semibold text-lg mb-6">
                Add an Employee
              </h2>

              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <dt className="text-slate-500 text-xs mb-1">Workspace</dt>
                    <dd className="text-slate-300 text-sm font-medium">—</dd>
                  </div>
                  <button className="px-4 py-2 bg-ev-yellow text-black text-sm font-semibold rounded-xl hover:bg-ev-yellow/90 transition-colors">
                    Select
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <dt className="text-slate-500 text-xs mb-1">Role</dt>
                    <dd className="text-slate-300 text-sm font-medium">
                      lightbulb monter
                    </dd>
                  </div>
                  <button className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl hover:border-ev-yellow/40 transition-colors">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <dt className="text-slate-500 text-xs mb-1">Salary</dt>
                    <dd className="text-slate-300 text-sm font-medium">
                      2000 PLN/month
                    </dd>
                  </div>
                  <button className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl hover:border-ev-yellow/40 transition-colors">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <dt className="text-slate-500 text-xs mb-1">Invite Link</dt>
                    <dd className="text-slate-300 text-sm font-medium break-all">
                      https://electro-vision/invite
                    </dd>
                  </div>
                  <button className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-slate-300 text-sm rounded-xl hover:border-ev-yellow/40 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}
