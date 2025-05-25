"use client";

import { FooterSmall } from "@/components/templates/FooterSmall";
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
import { DashboardData, DashboardRequest } from "@/ev-types/dashboard";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {
  const { User, UserDispatch } = useUserContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await OLF.post(ApiLinks.dashboard, {
          owner_email: User?.authUser?.email,
        });

        // Transform snake_case to camelCase
        const transformedData = {
          workspaceStats: response.workspace_stats,
          taskStats: response.task_stats,
          workerStats: response.worker_stats,
          nationalityData: response.nationality_data,
        };
        console.log(response);

        setData(transformedData as DashboardData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (User?.authUser?.email) {
      fetchData();
    }
  }, [User?.authUser?.email]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <PageTemplate bgClass="#F1F2F6">
      <NavbarTemplate />
      <section className="flex flex-row items-center h-full gap-8 w-[90vw]">
        <SidebarTemplate activeIcon="dashboard" />
        <ContentBlock>
          <div className="w-full space-y-8">
            {/* Workspace Stats */}
            <div className="bg-ev-primary-bg p-6 rounded-3xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Workspaces</h2>
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  title="Total"
                  value={data.workspaceStats.total}
                  color="bg-ev-primary"
                  fontColor="text-ev-text"
                />
                <StatCard
                  title="Active"
                  value={data.workspaceStats.active}
                  color="bg-green-500"
                />
                <StatCard
                  title="Completed"
                  value={data.workspaceStats.completed}
                  color="bg-blue-500"
                />
              </div>
            </div>

            {/* Task Stats */}
            <div className="bg-ev-primary-bg p-6 rounded-3xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Tasks</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Total", value: data.taskStats.total },
                      { name: "Completed", value: data.taskStats.completed },
                      { name: "In Progress", value: data.taskStats.inProgress },
                      { name: "Overdue", value: data.taskStats.overdue },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Worker Stats */}
            <div className="sm:grid sm:grid-cols-2  flex flex-col gap-6 ">
              <div className="bg-ev-primary-bg p-6 rounded-3xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  Workers by Position
                </h2>
                <div className="h-64">
                  {data.workerStats.by_position &&
                  data.workerStats.by_position.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.workerStats.by_position}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="position"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {data.workerStats.by_position.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(
                            value: number,
                            name: string,
                            props: any,
                          ) => [value, props.payload.position]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-ev-text-secondary">
                        No position data available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-ev-primary-bg p-6 rounded-3xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  Nationality Distribution
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.nationalityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="country" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}

const StatCard = ({
  title,
  value,
  color,
  fontColor = undefined,
}: {
  title: string;
  value: number;
  color: string;
  fontColor?: string;
}) => (
  <div className={`${color} p-4 rounded-xl ${fontColor ?? "text-white"}`}>
    <h3 className="text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
