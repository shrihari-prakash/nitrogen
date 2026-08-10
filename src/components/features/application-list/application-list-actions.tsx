import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ApplicationEditor from "../application-editor/application-editor";
import { Application } from "@/types/application";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import { useDeleteApplication } from "@/hooks/api/use-application-mutations";

export const ApplicationListActions = ({
  row,
  cell,
}: {
  row: any;
  cell: any;
  table: any;
}) => {
  const [value, setValue] = useState("");

  const context = cell.getContext();

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const meta = context.table.options.meta as any;

  const { mutateAsync: deleteApplication } = useDeleteApplication();

  const onApplicationDelete = async () => {
    const promise = deleteApplication(row.original._id);
    toast.promise(promise, {
      loading: `Deleting ${row.original.displayName}...`,
      success: `${row.original.displayName} deleted`,
      error: "Delete failed!",
    });
    await promise;
    meta.onApplicationDelete(row.original._id);
  };

  const onValueChange = (e: any) => {
    setValue(e.target.value);
  };

  const canDelete = (client: Application): boolean => {
    if (client.role === "external_client") {
      return isPermissionAllowed("admin:system:external-client:delete");
    } else {
      return isPermissionAllowed("admin:system:internal-client:delete");
    }
  };

  const canEdit = (client: Application): boolean => {
    if (client.role === "external_client") {
      return isPermissionAllowed("admin:system:external-client:write");
    } else {
      return isPermissionAllowed("admin:system:internal-client:write");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {isPermissionAllowed("admin:profile:access:write") && (
        <ScopeSelector
          entity={row.original}
          setEntity={() => null}
          scopes={meta.scopes || []}
          type="client"
          iconOnly
        />
      )}
      {canEdit(row.original) && (
        <ApplicationEditor
          application={row.original}
          onUpdate={meta.onApplicationUpdate}
        />
      )}
      {canDelete(row.original) && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              title={t("action.delete-application")}
            >
              <FaTrash className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-border/80">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("message.delete-entity", { entity: row.original.displayName })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("message.delete-client-consequences")}
                <div className="input-group mt-4 text-sm text-muted-foreground">
                  {t("message.type-to-delete", { name: row.original.id })}
                  <Input
                    className="mt-3 rounded-xl bg-card border-border/80"
                    value={value}
                    onChange={onValueChange}
                    placeholder={t("placeholder.type-to-confirm", { id: row.original.id })}
                  />
                </div>
                {row.original.role === "internal_client" &&
                  value === row.original.id && (
                    <Alert className="mt-3 rounded-xl" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>
                          {t("message.delete-internal-client-warning")}
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t("button.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onApplicationDelete}
                disabled={value !== row.original.id}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("button.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
