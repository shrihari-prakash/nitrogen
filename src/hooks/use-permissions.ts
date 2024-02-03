import { Scope } from "@/components/ui/scope-selector";
import MeContext from "@/context/me-context";
import ScopesContext from "@/context/scopes-context";
import { useContext, useEffect } from "react";

function isScopeAllowed(
  scope: string,
  allowedScopes: string[],
  allScopes: any
) {
  if (!allowedScopes) {
    allowedScopes = [];
  }
  const scopeObject = allScopes[scope];
  if (!scopeObject) {
    return false;
  }
  if (
    allowedScopes.includes(scopeObject.name) ||
    allowedScopes.includes(scopeObject.parent as string)
  ) {
    return true;
  } else if (scopeObject.parent) {
    return isScopeAllowed(scopeObject.parent, allowedScopes, allScopes);
  } else {
    return false;
  }
}

function usePermissions() {
  const { me } = useContext(MeContext);
  const { scopes, refreshScopes } = useContext(ScopesContext);

  useEffect(() => {
    if (!scopes) refreshScopes();
  }, [scopes, refreshScopes]);

  const isPermissionAllowed = (permission: string) => {
    if (!me || !scopes) {
      return false;
    }
    if (me.role === "super_admin") {
      return true;
    }
    const scopesObject: { [name: string]: Scope } = (scopes as Scope[]).reduce(
      (scopes, scope) => Object.assign(scopes, { [scope.name]: scope }),
      {}
    );
    return isScopeAllowed(permission, me.scope as string[], scopesObject);
  };

  return isPermissionAllowed;
}

export default usePermissions;
