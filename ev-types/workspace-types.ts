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
