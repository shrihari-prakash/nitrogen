import { createContext } from "react";

export type ISettingsContext = {
  settings: string[] | null;
  setSettings: any;
  refreshSettings: any;
};

const SettingsContext = createContext<ISettingsContext>({
  settings: null,
  setSettings: null,
  refreshSettings: null,
});
export default SettingsContext;
