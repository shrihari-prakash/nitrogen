import { useContext, useState } from "react";
import { Label } from "./label";
import MeContext from "@/context/me-context";
import { User } from "@/types/user";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./alert";
import { Checkbox } from "./checkbox";
import usePermissions from "@/hooks/use-permissions";
import { Application } from "@/types/application";
import { Input } from "./input";
import { FaKey, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Role } from "@/types/role";
import { Badge } from "./badge";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useUpdateAccess } from "@/hooks/api/use-user-mutations";

export interface Scope {
  name: string;
  adminDescription?: string;
  description: string;
  parent?: string;
}

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

const ScopeSelector = ({
  scopes,
  onSelect = () => null,
  entity,
  setEntity,
  type,
  role,
  warning = false,
}: {
  scopes: Scope[];
  onSelect?: any;
  entity: User | Application | Role;
  setEntity: any;
  type: "user" | "client" | "role";
  role?: string;
  warning?: boolean;
}) => {
  const scopesObject: { [name: string]: Scope } = scopes.reduce(
    (scopes, scope) => Object.assign(scopes, { [scope.name]: scope }),
    {}
  );

  const initialScopes: string[] = [];
  scopes.forEach((scope) => {
    if (isScopeAllowed(scope.name, entity.scope as string[], scopesObject)) {
      initialScopes.push(scope.name);
    }
  });

  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    initialScopes as string[]
  );

  const [expandedScopes, setExpandedScopes] = useState<string[]>([]);

  const [search, setSearch] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const onPopoverOpenChange = (state: boolean) => {
    console.log("Popover open state: " + state);
    setPopoverOpen(state);
  };

  const { me } = useContext(MeContext);

  const { t } = useTranslation();

  const { isPermissionAllowed, isPermissionAllowedByRole } = usePermissions();

  const isUserMe = () => {
    if (!me) {
      return false;
    }
    if (me.role === (entity as Role).id) {
      return true;
    }
    return me._id === entity._id;
  };

  const handleToggle = (itemName: string) => {
    const isSelected = selectedScopes.includes(itemName);
    let newSelectedItems: string[];

    if (isSelected) {
      // Deselect the item and all its children
      const children = getAllChildren(itemName);
      newSelectedItems = selectedScopes.filter(
        (item) => !children.includes(item) && itemName !== item
      );

      // Deselect all parent levels if their children are deselected
      let parent = getParent(itemName);
      while (parent) {
        const parentChildren = scopes.filter((item) => item.parent === parent);
        const anyChildrenDeselected = parentChildren.some(
          (child) => !newSelectedItems.includes(child.name)
        );

        if (anyChildrenDeselected) {
          newSelectedItems = newSelectedItems.filter((item) => item !== parent);
        }

        parent = getParent(parent);
      }
    } else {
      // If the item has children, select all children as well
      const children = getAllChildren(itemName);
      newSelectedItems = [...selectedScopes, itemName, ...children];

      // Select all parent levels if their children are deselected
      let parent = getParent(itemName);
      while (parent) {
        const parentChildren = scopes.filter((item) => item.parent === parent);
        const allChildrenSelected = parentChildren.every((child) =>
          newSelectedItems.includes(child.name)
        );

        if (allChildrenSelected && !newSelectedItems.includes(parent)) {
          newSelectedItems.push(parent);
        }

        parent = getParent(parent);
      }
    }

    setSelectedScopes(newSelectedItems);
    onSelect(newSelectedItems.join(", "));
  };

  const getParent = (itemName: string) => {
    const item = scopes.find((item) => item.name === itemName);
    return item ? item.parent : null;
  };

  const getAllChildren = (parent: string) => {
    const children = scopes.filter((item) => item.parent === parent);
    let allChildren = [...children.map((child) => child.name)];

    children.forEach((child) => {
      allChildren = [...allChildren, ...getAllChildren(child.name)];
    });

    return allChildren;
  };

  const onOpenChange = () => {
    setSearch("");
  };

  const { mutateAsync: updateAccess, isPending: submitting } = useUpdateAccess();

  const onSave = async () => {
    onPopoverOpenChange(false);
    let newScopeList = [...selectedScopes];
    scopes.forEach((scope) => {
      if (!scope.parent) {
        return;
      }
      if (isScopeAllowed(scope.parent, newScopeList, scopesObject)) {
        newScopeList = newScopeList.filter((s) => s !== scope.name);
      }
    });
    let promise;
    try {
      const targetId = type === "role" ? (entity as any).id : entity._id;
      promise = updateAccess({
        targets: [targetId],
        targetType: type,
        scope: newScopeList,
        operation: "set",
      });
      toast.promise(promise, {
        loading: "Updating permissions...",
        success: "Permissions updated",
        error: "Update failed!",
      });
      await promise;
      console.log("Permissions granted " + newScopeList.join(","));
      const userCopy = { ...entity };
      userCopy.scope = newScopeList;
      if (setEntity) {
        setEntity(userCopy);
      }
    } catch (e) {
      // Error handled by toast
    }
  };

  const toggleExpand = (itemName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (expandedScopes.includes(itemName)) {
      setExpandedScopes(expandedScopes.filter((s) => s !== itemName));
    } else {
      setExpandedScopes([...expandedScopes, itemName]);
    }
  };

  const hasMatchingDescendant = (itemName: string, searchTerm: string): boolean => {
    const children = scopes.filter((child) => child.parent === itemName);
    return children.some(
      (child) =>
        child.name.toLowerCase().includes(searchTerm) ||
        hasMatchingDescendant(child.name, searchTerm)
    );
  };

  const renderTree = (items: Scope[], parent = "*") => {
    return items
      .filter((item) => item.parent === parent)
      .map((item) => {
        const scopeAllowed = isScopeAllowed(
          item.name,
          me?.scope as string[],
          scopesObject
        );
        
        const children = items.filter((child) => child.parent === item.name);
        const hasChildren = children.length > 0;
        
        const searchTerm = search.toLowerCase();
        const matchesSearch = searchTerm === "" || item.name.toLowerCase().includes(searchTerm);
        const childrenMatchSearch = searchTerm !== "" && hasMatchingDescendant(item.name, searchTerm);
        
        if (searchTerm !== "" && !matchesSearch && !childrenMatchSearch) {
          return null;
        }

        const isExpanded = searchTerm !== "" || expandedScopes.includes(item.name);

        return (
          <div key={item.name} className="flex flex-col mt-1">
            <div className={`flex items-start rounded-md transition-colors ${matchesSearch ? "hover:bg-secondary/40" : "opacity-50"}`}>
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(item.name, e)}
                  className="p-2 mt-1 mr-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <FaChevronDown className="h-3 w-3" /> : <FaChevronRight className="h-3 w-3" />}
                </button>
              ) : (
                <div className="w-7 mr-1 shrink-0" />
              )}
              <Label className="flex-1 flex items-start py-2 pr-3 cursor-pointer">
                <div className="mt-1 flex items-center justify-center">
                  <Checkbox
                    disabled={!scopeAllowed || isUserMe()}
                    checked={selectedScopes.includes(item.name)}
                    onCheckedChange={() => handleToggle(item.name)}
                  />
                </div>
                <span className="mx-3 flex-1">
                  <div className="mb-1 text-sm font-medium leading-none">
                    {item.name}
                    {role &&
                      !selectedScopes.includes(item.name) &&
                      isPermissionAllowedByRole(item.name, role) &&
                      role !== "super_admin" ? (
                      <Badge variant="secondary" className="ml-2 font-normal text-xs">
                        {t("message.allowed-by-role")}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground font-normal leading-snug">
                    {item.adminDescription || item.description}
                  </div>
                </span>
              </Label>
            </div>
            {isExpanded && hasChildren && (
              <div className="ml-4 pl-3 border-l-2 border-border/50">
                {renderTree(items, item.name)}
              </div>
            )}
          </div>
        );
      });
  };

  if (!isPermissionAllowed("admin:profile:access:write")) {
    return null;
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div>
          <Button variant="outline" className="whitespace-nowrap">
            <FaKey className="h-4 w-4 mr-2" />
            {t("button.manage-permissions")}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t("heading.managing-permissions-for", {
              entity:
                "firstName" in entity
                  ? (entity as User).firstName + " " + (entity as User).lastName
                  : entity.displayName,
            })}
          </DialogTitle>
          <DialogDescription>
            {isUserMe() && (
              <Alert className="mt-2">
                <AlertDescription>
                  {t("message.cannot-edit-own-permissions")}
                </AlertDescription>
              </Alert>
            )}
          </DialogDescription>
          <div className="p-2">
            <Input
              placeholder="Start typing to search"
              onChange={(e) => setSearch(e.target.value)}
              autoCapitalize="none"
            />
          </div>
        </DialogHeader>
        <div
          className={
            "grid overflow-auto flex-1 " + (isUserMe() ? "opacity-50" : "")
          }
        >
          {scopes && renderTree(scopes)}
        </div>
        <DialogFooter>
          {!warning ? (
            <Button
              type="submit"
              disabled={submitting || isUserMe()}
              onClick={onSave}
            >
              {t("button.save-changes")}
            </Button>
          ) : (
            <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
              <PopoverTrigger disabled={submitting || isUserMe()}>
                <Button disabled={submitting || isUserMe()}>
                  {t("button.save-changes")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-3">
                <span className="text-sm opacity-75">
                  {t(warning ? t("message.scopes-changed") : "")}
                </span>
                <Button
                  type="submit"
                  disabled={submitting || isUserMe()}
                  onClick={onSave}
                >
                  {t("button.yes")}
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScopeSelector;
