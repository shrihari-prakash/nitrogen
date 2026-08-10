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
import { useContext, useState } from "react";
import { toast } from "sonner";
import { Role } from "@/types/role";
import RoleEditor from "../role-editor/role-editor";
import RolesContext from "@/context/roles-context";
import { useTranslation } from "react-i18next";
import { Lock, Trash2 } from "lucide-react";
import { useDeleteRole } from "@/hooks/api/use-role-mutations";

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

  const { mutateAsync: deleteRole } = useDeleteRole();

  const onRoleDelete = async () => {
    const promise = deleteRole(row.original.id);
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

  const role: Role = row.original;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {isPermissionAllowed("admin:profile:access:write") &&
        role.id !== "super_admin" && (
          <ScopeSelector
            entity={role}
            setEntity={onScopeChange}
            scopes={meta.scopes || []}
            type="role"
            warning
            iconOnly
          />
        )}
      {canEdit(role) && (
        <RoleEditor role={role} onUpdate={meta.onRoleUpdate} />
      )}

      {canDelete(role) ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              title={t("action.delete-role")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-border/80">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("message.delete-entity", { entity: role.displayName })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="input-group mt-4 text-sm text-muted-foreground">
                  {t("message.type-to-delete", { name: role.id })}
                  <Input
                    className="mt-3 rounded-xl bg-card border-border/80"
                    value={value}
                    onChange={onValueChange}
                    placeholder={t("placeholder.type-to-confirm", { id: role.id })}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t("button.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onRoleDelete}
                disabled={value !== role.id}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("button.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : role.system ? (
        <Button
          variant="outline"
          size="icon"
          disabled
          className="h-9 w-9 rounded-xl opacity-50 cursor-not-allowed border-border/50 bg-muted/30"
          title={t("message.system-role-protected")}
        >
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      ) : null}
    </div>
  );
};

