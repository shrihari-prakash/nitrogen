export type Application = {
  _id: string;
  id: string;
  secret: string;
  isPublic?: boolean;
  displayName: string;
  role: "internal_client" | "external_client";
  grants: string[];
  scope: string[];
  redirectUris: string[];
  firstName: string; //dummy
  lastName: string; //dummy
};
