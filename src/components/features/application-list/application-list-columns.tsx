import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import {
  Box,
  MonitorSmartphone,
  Package,
  PackageCheck,
  RefreshCcw,
  Verified,
} from "lucide-react";
import { ApplicationListActions } from "./application-list-actions";

const getGrantIcon = (
  grantType: "client_credentials" | "authorization_code" | "refresh_token"
) => {
  const iconMap = {
    client_credentials: <Box className="h-4 w-4 ml-2" />,
    authorization_code: <MonitorSmartphone className="h-4 w-4 ml-2" />,
    refresh_token: <RefreshCcw className="h-4 w-4 ml-2" />,
  };
  return iconMap[grantType];
};

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center flex-nowrap whitespace-nowrap">
        {row.getValue("id")}
        {row.original.role === "internal_client" && (
          <Verified className="h-4 w-4 ml-2" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "displayName",
    header: "Display Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("displayName")} </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize flex items-center flex-nowrap whitespace-nowrap">
        {(row.getValue("role") as string).split("_").join(" ")}{" "}
        {row.getValue("role") === "internal_client" && (
          <PackageCheck className="h-4 w-4 ml-2" />
        )}
        {row.getValue("role") === "external_client" && (
          <Package className="h-4 w-4 ml-2" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "grants",
    header: "Grants",
    cell: ({ row }) => (
      <div className="flex items-center">
        {(row.getValue("grants") as any as string[])
          .sort()
          .map((grant: string) => (
            <div className="capitalize flex items-center">
              {getGrantIcon(grant as any)}&nbsp;{grant.split("_")[0]}
            </div>
          ))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ApplicationListActions,
  },
];
