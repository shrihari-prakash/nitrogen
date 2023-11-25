import { User } from "@/types/user";
import { createContext } from "react";

export type IUsersContext = {
  users: User[];
  setUsers: any;
};

const UsersContext = createContext<IUsersContext>({
  users: [],
  setUsers: null,
});
export default UsersContext;

export type IUsersSearchResultsContext = {
  usersSearchResults: User[] | null;
  setUsersSearchResults: any;
};

export const UsersSearchResultsContext =
  createContext<IUsersSearchResultsContext>({
    usersSearchResults: null,
    setUsersSearchResults: null,
  });
