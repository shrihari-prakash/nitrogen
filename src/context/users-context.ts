import { createContext } from "react";

export type IMeContext = {
  users: any[] | null;
  setUsers: any;
};

const UsersContext = createContext<IMeContext>({ users: null, setUsers: null });
export default UsersContext;
