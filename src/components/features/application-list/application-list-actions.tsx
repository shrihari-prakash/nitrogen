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
import axiosInstance from "@/service/axios";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ApplicationEditor from "../application-editor/application-editor";
import { Application } from "@/types/application";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";

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

  const onApplicationDelete = async () => {
    const promise = axiosInstance.delete("/client/admin-api/delete", {
      data: {
        target: row.original._id,
      },
    });
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
    <div className="flex items-center justify-center">
      {isPermissionAllowed("admin:profile:access:write") && (
        <ScopeSelector
          entity={row.original}
          setEntity={() => null}
          scopes={meta.scopes || []}
          type="client"
        />
      )}
      {canEdit(row.original) && (
        <ApplicationEditor
          application={row.original}
          onUpdate={meta.onApplicationUpdate}
        />
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
              Delete {row.original.displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting clients might have unintended consequences in the system.
              This action cannot be undone. Are you sure you want to delete?
              <div className="input-group mt-4">
                Type <strong>{row.original.id}</strong> in the box below to
                enable the delete button.
                <Input
                  className="mt-4"
                  value={value}
                  onChange={onValueChange}
                />
              </div>
              {row.original.role === "internal_client" &&
                value === row.original.id && (
                  <Alert className="mt-2" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>
                        You are deleting an internal client. This might break
                        your system completely. Delete at your own risk.
                      </strong>
                    </AlertDescription>
                  </Alert>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("button.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onApplicationDelete}
              disabled={value !== row.original.id}
            >
              {t("button.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
