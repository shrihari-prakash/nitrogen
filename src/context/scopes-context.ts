import { Scope } from "@/components/ui/scope-selector";
import { createContext } from "react";

export type IScopesContext = {
  scopes: Scope[] | null;
  refreshScopes: any;
};

const ScopesContext = createContext({
  scopes: null,
  refreshScopes: () => {},
});
export default ScopesContext;
