import { createContext } from "react";

export type IMeContext = {
  roles: string[] | null;
  refreshRoles: any;
};

const RolesContext = createContext({
  roles: null,
  refreshRoles: () => {},
});
export default RolesContext;
