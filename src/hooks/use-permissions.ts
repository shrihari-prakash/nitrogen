import { Scope } from "@/components/ui/scope-selector";
import MeContext from "@/context/me-context";
import RolesContext from "@/context/roles-context";
import ScopesContext from "@/context/scopes-context";
import { Role } from "@/types/role";
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
  const { roles, refreshRoles } = useContext(RolesContext);

  useEffect(() => {
    if (!roles) refreshRoles();
  }, [roles, refreshRoles]);

  useEffect(() => {
    if (!scopes) refreshScopes();
  }, [scopes, refreshScopes]);

  const isPermissionAllowed = (permission: string, excludeRole = false) => {
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
    const allowed = isScopeAllowed(
      permission,
      me.scope as string[],
      scopesObject
    );
    if (!allowed) {
      if (excludeRole) {
        return false;
      }
      return isPermissionAllowedByRole(permission, me.role as string);
    }
    return allowed;
  };

  const isPermissionAllowedByRole = (permission: string, role: string) => {
    if (!roles || !scopes) {
      return false;
    }
    const roleObject = (roles as unknown as Role[]).find((r) => r.id === role);
    if (!roleObject) {
      return false;
    }
    const scopesObject: { [name: string]: Scope } = (scopes as Scope[]).reduce(
      (scopes, scope) => Object.assign(scopes, { [scope.name]: scope }),
      {}
    );
    return isScopeAllowed(
      permission,
      roleObject.scope as string[],
      scopesObject
    );
  };

  return { isPermissionAllowed, isPermissionAllowedByRole };
}

export default usePermissions;
