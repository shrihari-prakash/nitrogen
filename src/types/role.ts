export type Role = {
  _id: string;
  id: string;
  displayName: string;
  description: string;
  scope: string[];
  ranking: number;
  system: boolean;
  type: "user" | "client";
};
