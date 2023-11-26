import { createContext } from "react";

export type IRolesContext = {
  roles: string[] | null;
  refreshRoles: any;
};

const RolesContext = createContext({
  roles: null,
  refreshRoles: () => {},
});
export default RolesContext;
