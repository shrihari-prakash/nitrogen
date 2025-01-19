import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScopeSelector from "@/components/ui/scope-selector";
import usePermissions from "@/hooks/use-permissions";
import axiosInstance from "@/service/axios";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { Role } from "@/types/role";
import RoleEditor from "../role-editor/role-editor";
import RolesContext from "@/context/roles-context";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";

export const RoleListActions = ({
  row,
  cell,
}: {
  row: any;
  cell: any;
  table: any;
}) => {
  const [value, setValue] = useState("");

  const context = cell.getContext();

  const { refreshRoles } = useContext(RolesContext);
  const { isPermissionAllowed } = usePermissions();
  const { t } = useTranslation();

  const meta = context.table.options.meta as any;

  const onRoleDelete = async () => {
    const promise = axiosInstance.delete("/roles/admin-api/delete", {
      data: {
        target: row.original.id,
      },
    });
    toast.promise(promise, {
      loading: `Deleting ${row.original.displayName}...`,
      success: `${row.original.displayName} deleted`,
      error: "Delete failed!",
    });
    await promise;
    meta.onRoleDelete(row.original.id);
  };

  const onValueChange = (e: any) => {
    setValue(e.target.value);
  };

  const canDelete = (role: Role): boolean => {
    return isPermissionAllowed("admin:roles:delete") && !role.system;
  };

  const canEdit = (role: Role): boolean => {
    return isPermissionAllowed("admin:roles:delete") && !role.system;
  };

  const onScopeChange = () => {
    refreshRoles();
  };

  return (
    <div className="flex items-center justify-right">
      {isPermissionAllowed("admin:profile:access:write") &&
        row.original.id !== "super_admin" && (
          <ScopeSelector
            entity={row.original}
            setEntity={onScopeChange}
            scopes={meta.scopes || []}
            type="role"
            warning
          />
        )}
      {canEdit(row.original) && (
        <RoleEditor role={row.original} onUpdate={meta.onRoleUpdate} />
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {canDelete(row.original) && (
            <Button className="ml-2" variant="outline">
              <FaTrash className="h-4 w-4" />
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("message.delete-entity", { entity: row.original.displayName })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="input-group mt-4">
                Type <strong>{row.original.id}</strong> in the box below to
                enable the delete button.
                <Input
                  className="mt-4"
                  value={value}
                  onChange={onValueChange}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRoleDelete}
              disabled={value !== row.original.id}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
