import { User } from "@/types/user";
import { createContext } from "react";

export type IMeContext = {
  me: User | null;
  setMe: any;
};

const MeContext = createContext<IMeContext>({ me: null, setMe: null });
export default MeContext;
