"use client";

import NavbarTemplate from "@/components/templates/NavbarTemplate";
import useUserContext from "@/ev-contexts/userContextProvider";
import { useEffect, useState } from "react";
import PageTemplate from "@/components/templates/PageTemplate";
import SidebarTemplate from "@/components/templates/SidebarTemplate";
import ContentBlock from "@/components/ContentBlock";
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardData } from "@/ev-types/dashboard";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Loader2,
} from "lucide-react";

const PIE_COLORS = ["#F6AA1C", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#06b6d4"];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  color: "#f1f5f9",
};

export default function Dashboard() {
  const { User } = useUserContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await OLF.post(
          ApiLinks.dashboard,
          { owner_email: User?.authUser?.email },
          undefined,
          User.authUser?.token ?? ""
        );

        setData({
          workspaceStats: response.workspace_stats,
          taskStats: response.task_stats,
          workerStats: response.worker_stats,
          nationalityData: response.nationality_data,
        } as DashboardData);
      } catch (err: any) {
        if (
          err.message?.includes("401") ||
          err.message?.includes("Unauthorized") ||
          err.message?.includes("Authorization header")
        ) {
          router.push("/unauthorized");
          return;
        }
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (User?.authUser?.email) fetchData();
  }, [User?.authUser?.email]);

  return (
    <PageTemplate>
      <div className="flex h-screen overflow-hidden">
        <SidebarTemplate />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavbarTemplate />
          <ContentBlock blockClassName="p-6 gap-6">
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-ev-yellow animate-spin" />
              </div>
            )}

            {error && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-slate-400">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && !data && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-400">No data available</p>
              </div>
            )}

            {data && (
              <div className="flex flex-col gap-6">
                {/* ── stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Building2 className="w-5 h-5" />}
                    title="Total Workspaces"
                    value={data.workspaceStats.total}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                  />
                  <StatCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    title="Active Workspaces"
                    value={data.workspaceStats.active}
                    color="text-green-400"
                    bg="bg-green-500/10"
                  />
                  <StatCard
                    icon={<Users className="w-5 h-5" />}
                    title="Total Workers"
                    value={data.workerStats.total}
                    color="text-ev-yellow"
                    bg="bg-ev-yellow/10"
                  />
                  <StatCard
                    icon={<AlertTriangle className="w-5 h-5" />}
                    title="Overdue Tasks"
                    value={data.taskStats.overdue}
                    color="text-red-400"
                    bg="bg-red-500/10"
                  />
                </div>

                {/* ── task bar chart ── */}
                <ChartCard title="Task Overview">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={[
                        { name: "Total", value: data.taskStats.total },
                        { name: "Completed", value: data.taskStats.completed },
                        { name: "In Progress", value: data.taskStats.inProgress },
                        { name: "Overdue", value: data.taskStats.overdue },
                      ]}
                      barSize={36}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#F6AA1C" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* ── bottom row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* workers by position */}
                  <ChartCard title="Workers by Position">
                    {data.workerStats.by_position && data.workerStats.by_position.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={data.workerStats.by_position}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            nameKey="position"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {data.workerStats.by_position.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={CHART_TOOLTIP_STYLE}
                            formatter={(value: number, _name: string, props: any) => [
                              value,
                              props.payload.position,
                            ]}
                          />
                          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
                        No position data available
                      </div>
                    )}
                  </ChartCard>

                  {/* nationality distribution */}
                  <ChartCard title="Nationality Distribution">
                    {data.nationalityData && data.nationalityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart layout="vertical" data={data.nationalityData} barSize={18}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                          <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="country" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
                        No nationality data available
                      </div>
                    )}
                  </ChartCard>
                </div>
              </div>
            )}
          </ContentBlock>
        </div>
      </div>
    </PageTemplate>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
      <h3 className="text-slate-100 font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}
