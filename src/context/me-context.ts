import { createContext } from "react";

export type IMeContext = {
  me: any;
  setMe: any;
};

const MeContext = createContext<IMeContext>({ me: null, setMe: null });
export default MeContext;
