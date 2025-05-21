export type Workspace = {
  id: number;
  plan_file_name: string;
  start_date: Date;
  finish_date: Date | null;
  geolocation: String | null;
  ev_subscription: string;
  name: string;
  coverPhoto: string | File | null;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  assigner_username: string;
  assignee_username: string;
  description_multimedia: string | null;
  description_multimedia_filename: string | null;
  category: string;
  created_at: Date;
  due_date: Date | null;
  status: "HELP_NEEDED" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  importance: "LOW" | "MEDIUM" | "HIGH";
  //future multimedium
};
