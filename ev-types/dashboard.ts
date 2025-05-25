export interface DashboardData {
  workspaceStats: {
    total: number;
    active: number;
    completed: number;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  workerStats: {
    total: number;
    active: number;
    by_position?: {
      position: string;
      count: number;
    }[];
  };
  nationalityData: {
    country: string;
    count: number;
    percentage: number;
  }[];
}
export interface DashboardRequest {
  owner_email: string;
}
