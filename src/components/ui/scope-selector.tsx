import * as React from "react";
import { Label } from "./label";
import MeContext from "@/context/me-context";
import { User } from "@/types/user";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { toast } from "sonner";
import { Checkbox } from "./checkbox";
import usePermissions from "@/hooks/use-permissions";
import { Application } from "@/types/application";
import { Input } from "./input";
import {
  KeyRound,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  ChevronsDownUp,
  Search,
  X,
  Shield,
  ShieldAlert, Check,
  Crown,
} from "lucide-react";
import { Role } from "@/types/role";
import { Badge } from "./badge";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useUpdateAccess } from "@/hooks/api/use-user-mutations";
import { EmptyState } from "./empty-state";

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
  iconOnly = false,
}: {
  scopes: Scope[];
  onSelect?: any;
  entity: User | Application | Role;
  setEntity: any;
  type: "user" | "client" | "role";
  role?: string;
  warning?: boolean;
  iconOnly?: boolean;
}) => {
  const scopesObject: { [name: string]: Scope } = React.useMemo(() => {
    return (scopes || []).reduce(
      (acc, scope) => Object.assign(acc, { [scope.name]: scope }),
      {}
    );
  }, [scopes]);

  const initialScopes: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (scopes && entity.scope) {
      scopes.forEach((scope) => {
        if (isScopeAllowed(scope.name, entity.scope as string[], scopesObject)) {
          list.push(scope.name);
        }
      });
    }
    return list;
  }, [scopes, entity.scope, scopesObject]);

  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>(initialScopes);
  const [expandedScopes, setExpandedScopes] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false);

  // Sync initial scopes when sheet opens or entity changes
  React.useEffect(() => {
    setSelectedScopes(initialScopes);
  }, [initialScopes, open]);

  // Ensure pointer-events are unlocked whenever the sheet closes
  React.useEffect(() => {
    if (!open) {
      setPopoverOpen(false);
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const onPopoverOpenChange = (state: boolean) => {
    setPopoverOpen(state);
  };

  const { me } = React.useContext(MeContext);
  const { t } = useTranslation();
  const { isPermissionAllowed, isPermissionAllowedByRole } = usePermissions();

  const isUserMe = () => {
    if (!me) return false;
    if (type === "role" && me.role === (entity as Role).id) return true;
    return me._id === entity._id;
  };

  const getParent = (itemName: string) => {
    const item = scopes.find((item) => item.name === itemName);
    return item ? item.parent : null;
  };

  const getAllChildren = (parent: string): string[] => {
    const children = scopes.filter((item) => item.parent === parent);
    let allChildren = [...children.map((child) => child.name)];
    children.forEach((child) => {
      allChildren = [...allChildren, ...getAllChildren(child.name)];
    });
    return allChildren;
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

      // Select all parent levels if all their children are selected
      let parent = getParent(itemName);
      while (parent) {
        const parentChildren = scopes.filter((item) => item.parent === parent);
        const allChildrenSelected = parentChildren.every((child) =>
          newSelectedItems.includes(child.name)
        );

        if (allChildrenSelected) {
          newSelectedItems.push(parent);
        }

        parent = getParent(parent);
      }
    }

    setSelectedScopes(newSelectedItems);
    onSelect(newSelectedItems.join(", "));
  };

  // Batch Select / Deselect All Toggle
  const allowableScopes = React.useMemo(() => {
    return (scopes || [])
      .filter((s) => isScopeAllowed(s.name, me?.scope as string[], scopesObject))
      .map((s) => s.name);
  }, [scopes, me?.scope, scopesObject]);

  const isAllSelected =
    allowableScopes.length > 0 &&
    allowableScopes.every((name) => selectedScopes.includes(name));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedScopes([]);
      onSelect("");
    } else {
      setSelectedScopes(allowableScopes);
      onSelect(allowableScopes.join(", "));
    }
  };

  // Parent Scopes & Expand All Toggle
  const allParentScopes = React.useMemo(() => {
    return (scopes || [])
      .filter((s) => scopes.some((c) => c.parent === s.name))
      .map((s) => s.name);
  }, [scopes]);

  const isAllExpanded =
    allParentScopes.length > 0 &&
    allParentScopes.every((s) => expandedScopes.includes(s));

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedScopes([]);
    } else {
      setExpandedScopes(allParentScopes);
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearch("");
      setPopoverOpen(false);
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 50);
    }
  };

  const { mutateAsync: updateAccess, isPending: submitting } = useUpdateAccess();

  const onSave = async () => {
    setPopoverOpen(false);
    let newScopeList = [...selectedScopes];
    scopes.forEach((scope) => {
      if (!scope.parent) {
        return;
      }
      if (isScopeAllowed(scope.parent, newScopeList, scopesObject)) {
        newScopeList = newScopeList.filter((s) => s !== scope.name);
      }
    });

    try {
      const targetId = type === "role" ? (entity as any).id : entity._id;
      const promise = updateAccess({
        targets: [targetId],
        targetType: type,
        scope: newScopeList,
        operation: "set",
      });
      toast.promise(promise, {
        loading: "Updating permissions...",
        success: "Permissions updated successfully",
        error: "Update failed!",
      });
      await promise;
      const userCopy = { ...entity };
      userCopy.scope = newScopeList;
      if (setEntity) {
        setEntity(userCopy);
      }
      setOpen(false);
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 50);
    } catch {
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
        (child.description && child.description.toLowerCase().includes(searchTerm)) ||
        (child.adminDescription && child.adminDescription.toLowerCase().includes(searchTerm)) ||
        hasMatchingDescendant(child.name, searchTerm)
    );
  };

  const grantedCount = selectedScopes.length;

  // Entity display name helper
  const getEntityDisplayName = () => {
    if ("firstName" in entity) {
      const u = entity as User;
      return `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.name || "User";
    }
    if ("displayName" in entity) {
      return (entity as Role | Application).displayName || (entity as any).id || "Entity";
    }
    return "Entity";
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
        const isSelected = selectedScopes.includes(item.name);
        const isInherited = role
          ? isPermissionAllowedByRole(item.name, role) && role !== "super_admin"
          : false;

        // Search Match
        const searchTerm = search.toLowerCase().trim();
        const matchesSearch =
          searchTerm === "" ||
          item.name.toLowerCase().includes(searchTerm) ||
          (item.description && item.description.toLowerCase().includes(searchTerm)) ||
          (item.adminDescription && item.adminDescription.toLowerCase().includes(searchTerm));
        const childrenMatchSearch =
          searchTerm !== "" && hasMatchingDescendant(item.name, searchTerm);

        if (searchTerm !== "" && !matchesSearch && !childrenMatchSearch) {
          return null;
        }

        const isExpanded = searchTerm !== "" || expandedScopes.includes(item.name);
        const isWildcard = item.name === "*" || item.name.endsWith(":*");

        return (
          <div key={item.name} className="flex flex-col mt-1 group/tree">
            <div
              className={`flex items-start rounded-xl p-1.5 sm:p-2 transition-colors hover:bg-accent/40 ${!scopeAllowed ? "opacity-60" : ""
                }`}
            >
              {/* Expand / Collapse Button or Leaf Dot Indicator */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleExpand(item.name, e)}
                  className="w-[22px] h-[22px] mt-0.5 mr-1 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                  title={isExpanded ? "Collapse group" : "Expand group"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <div className="w-[22px] h-[22px] mt-0.5 mr-1 shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                </div>
              )}

              {/* Label & Checkbox */}
              <Label className="flex-1 flex items-start py-0.5 pr-2 cursor-pointer select-none">
                <div className="mt-0.5 flex items-center justify-center">
                  <Checkbox
                    disabled={!scopeAllowed || isUserMe()}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(item.name)}
                  />
                </div>

                <div className="mx-3 flex-1 min-w-0">
                  {/* Name and Badges Header */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-semibold text-foreground tracking-tight break-all">
                      {item.name}
                    </span>

                    {/* Wildcard Badge */}
                    {isWildcard && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-medium gap-1.5 rounded-md shadow-2xs"
                      >
                        <Crown className="w-3.5 h-3.5" /> Wildcard Full
                      </Badge>
                    )}

                    {/* Role Inherited Badge */}
                    {isInherited && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2.5 py-0.5 font-medium bg-primary/10 text-primary border border-primary/25 rounded-md gap-1.5 shadow-2xs"
                      >
                        <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                        {t("message.allowed-by-role")}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                    {item.adminDescription || item.description || "No description provided."}
                  </p>
                </div>
              </Label>
            </div>

            {/* Nested Subtree with Visual Hierarchy Branch Line */}
            {isExpanded && hasChildren && (
              <div className="ml-4 pl-3 sm:ml-5 sm:pl-4 border-l-2 border-border/50 my-1 space-y-1">
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {iconOnly ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/70 hover:bg-accent transition-colors"
            title={t("button.manage-permissions")}
          >
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button variant="outline" className="whitespace-nowrap">
            <KeyRound className="h-4 w-4 mr-2" />
            {t("button.manage-permissions")}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="w-full md:!max-w-[700px] overflow-hidden flex flex-col p-0 gap-0 border-l border-border/80 shadow-2xl bg-background"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "";
        }}
      >
        {/* Modal Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border/40 bg-card/60">
          <SheetTitle className="text-xl font-bold tracking-tight text-left">
            {t("heading.managing-permissions-for", {
              entity: getEntityDisplayName(),
            })}
          </SheetTitle>
          {isUserMe() && (
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium text-left">
              <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
              <span>{t("message.cannot-edit-own-permissions")}</span>
            </div>
          )}
        </SheetHeader>

        {/* Search Bar & Action Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-border/40 bg-card/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("placeholder.search-permissions") || "Search permissions..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoCapitalize="none"
              className="pl-9 pr-9 h-9 text-xs rounded-lg bg-card border-border/70 focus-visible:ring-primary/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleToggleExpandAll}
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg border-border/70 shrink-0"
              title={isAllExpanded ? t("button.collapse-all") || "Collapse All" : t("button.expand-all") || "Expand All"}
            >
              {isAllExpanded ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </Button>

            {!isUserMe() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleSelectAll}
                className="h-9 px-3 text-xs rounded-lg border-border/70 shrink-0"
              >
                {isAllSelected
                  ? t("button.deselect-all") || "Deselect All"
                  : t("button.select-all") || "Select All"}
              </Button>
            )}
          </div>
        </div>

        {/* Tree Content Container */}
        <div
          className={`p-4 sm:p-6 overflow-y-auto flex-1 ${isUserMe() ? "opacity-50 pointer-events-none" : ""
            }`}
        >
          {scopes && scopes.length > 0 ? (
            <div className="space-y-1">
              {renderTree(scopes)}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                title={t("message.no-matching-permissions")}
                description={t("message.no-matching-permissions-desc")}
                icon={<KeyRound className="w-6 h-6 text-muted-foreground" />}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <SheetFooter className="p-4 px-6 border-t border-border/50 bg-card/70 backdrop-blur-md flex flex-row items-center justify-between sm:justify-between gap-3">
          {/* Selected Counter */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>
              <strong className="text-foreground font-mono">{grantedCount}</strong> permissions selected
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs h-9 px-3.5"
              disabled={submitting}
            >
              {t("button.cancel")}
            </Button>

            {!warning ? (
              <Button
                type="submit"
                size="sm"
                className="text-xs font-semibold h-9 px-4 shadow-xs gap-1.5"
                disabled={submitting || isUserMe()}
                onClick={onSave}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{submitting ? t("button.saving") : t("button.save-changes")}</span>
              </Button>
            ) : (
              <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange} modal={false}>
                <PopoverTrigger asChild disabled={submitting || isUserMe()}>
                  <Button
                    size="sm"
                    className="text-xs font-semibold h-9 px-4 shadow-xs gap-1.5"
                    disabled={submitting || isUserMe()}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{submitting ? t("button.saving") : t("button.save-changes")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-3 p-4 rounded-xl border-border/80 shadow-xl max-w-xs">
                  <div className="flex items-start gap-2 text-xs">
                    <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">
                      {t("message.scopes-changed")}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPopoverOpen(false)}
                      className="text-xs h-8 px-2.5"
                    >
                      {t("button.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitting || isUserMe()}
                      onClick={onSave}
                      className="text-xs h-8 px-3 font-semibold"
                    >
                      {t("button.yes")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ScopeSelector;
