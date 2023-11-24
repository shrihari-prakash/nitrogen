import { useContext, useState } from "react";
import { Label } from "./label";
import MeContext from "@/context/me-context";
import { User } from "@/types/user";
import axiosInstance from "@/service/axios";
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
import { toast } from "react-toastify";
import { Alert, AlertDescription } from "./alert";
import { Checkbox } from "./checkbox";
import usePermissions from "@/hooks/use-permissions";
import { Application } from "@/types/application";
import { Input } from "./input";

export interface Scope {
  name: string;
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
  user,
  setUser,
  type,
}: {
  scopes: Scope[];
  onSelect?: any;
  user: User | Application;
  setUser: any;
  type: "user" | "client";
}) => {
  const scopesObject: { [name: string]: Scope } = scopes.reduce(
    (scopes, scope) => Object.assign(scopes, { [scope.name]: scope }),
    {}
  );

  const initialScopes: string[] = [];
  scopes.forEach((scope) => {
    if (isScopeAllowed(scope.name, user.scope as string[], scopesObject)) {
      initialScopes.push(scope.name);
    }
  });

  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    initialScopes as string[]
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const { me } = useContext(MeContext);

  const isPermissionAllowed = usePermissions();

  const isUserMe = () => {
    if (!me) {
      return false;
    }
    return me._id === user._id;
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

  const onSave = async () => {
    let newScopeList = [...selectedScopes];
    scopes.forEach((scope) => {
      if (!scope.parent) {
        return;
      }
      if (isScopeAllowed(scope.parent, newScopeList, scopesObject)) {
        newScopeList = newScopeList.filter((s) => s !== scope.name);
      }
    });
    setSubmitting(true);
    let promise;
    try {
      promise = axiosInstance.post("/user/admin-api/access", {
        targets: [user._id],
        targetType: type,
        scope: newScopeList,
        operation: "set",
      });
      toast.promise(promise, {
        pending: "Submitting...",
        success: "Update successfull",
        error: "Update failed!",
      });
      await promise;
      console.log("Permissions granted " + newScopeList.join(","));
      const userCopy = { ...user };
      userCopy.scope = newScopeList;
      if (setUser) {
        setUser(userCopy);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderTree = (items: Scope[], parent = "*") => {
    return items
      .filter((item) => item.parent === parent)
      .map((item) => {
        return (
          <div
            key={item.name}
            className={
              !isScopeAllowed(item.name, me?.scope as string[], scopesObject) ||
              isUserMe()
                ? "opacity-80"
                : ""
            }
          >
            {search !== "" && !item.name.includes(search) ? null : (
              <Label className="flex items-center my-2 space-x-3 px-3 py-2">
                <Checkbox
                  disabled={
                    !isScopeAllowed(
                      item.name,
                      me?.scope as string[],
                      scopesObject
                    ) || isUserMe()
                  }
                  checked={selectedScopes.includes(item.name)}
                  onCheckedChange={() => handleToggle(item.name)}
                />
                <span className="mx-2">
                  <div className="mb-2 text-normal">{item.name}</div>
                  <div className="opacity-40 font-normal">
                    {item.description}
                  </div>
                </span>
              </Label>
            )}
            <div className="mx-8">{renderTree(items, item.name)}</div>
          </div>
        );
      });
  };

  if (!isPermissionAllowed("admin:profile:access:write")) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <Button variant="outline">Manage Permissions</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            Managing permissions for{" "}
            {user.firstName
              ? user.firstName + " " + user.lastName
              : user.displayName}
          </DialogTitle>
          <DialogDescription>
            {isUserMe() && (
              <Alert className="mt-2">
                <AlertDescription>
                  You can't edit your own permissions
                </AlertDescription>
              </Alert>
            )}
          </DialogDescription>
          <div className="p-2">
            <Input
              placeholder="Start typing to search"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </DialogHeader>
        <div className="grid max-h-[400px] overflow-auto">
          {scopes && renderTree(scopes)}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={submitting || isUserMe()}
            onClick={onSave}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScopeSelector;
