export type Application = {
  id: string;
  secret: string;
  displayName: string;
  role: "internal_client" | "external_client";
  grants: string[];
  redirectUris: string[];
};
