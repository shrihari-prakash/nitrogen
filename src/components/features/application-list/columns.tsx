import { Button } from "@/components/ui/button";
import ScopeSelector from "@/components/ui/scope-selector";
import axiosInstance from "@/service/axios";
import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { Verified } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "wouter";

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableHiding: false,
    cell: ({ row }) => (
      <Link
        href={`/applications/${row.original.id}`}
        className="flex items-center justify-start"
      >
        {row.getValue("id")}
        &nbsp;
        {row.original.role === "internal_client" && (
          <Verified className="h-4 w-4" />
        )}
      </Link>
    ),
  },
  {
    accessorKey: "displayName",
    header: "Display Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("displayName")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize">
        {(row.getValue("role") as string).split("_").join(" ")}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, cell }) => {
      const meta = cell.getContext().table?.options?.meta as any;
      const onApplicationDelete = async () => {
        const promise = axiosInstance.delete("/client/admin-api/delete", {
          data: {
            target: row.original._id,
          },
        });
        toast.promise(promise, {
          pending: "Deleting...",
          success: "Delete successfull",
          error: "Delete failed!",
        });
        await promise;
        meta.onApplicationDelete(row.original._id);
      };
      return (
        <div className="flex items-center justify-center">
          <ScopeSelector
            user={row.original}
            setUser={() => null}
            scopes={meta.scopes || []}
            type="client"
            title={false}
            onSelect={(selected: string) => console.log(selected)}
          />
          <Button
            className="ml-2"
            variant={"outline"}
            onClick={onApplicationDelete}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
