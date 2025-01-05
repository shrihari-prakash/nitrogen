import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";
import { ApplicationListActions } from "./application-list-actions";
import i18n from "i18next";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { BsFillBoxFill } from "react-icons/bs";
import { PiDevicesFill } from "react-icons/pi";

const getGrantIcon = (
  grantType: "client_credentials" | "authorization_code" | "refresh_token"
) => {
  const iconMap = {
    client_credentials: <BsFillBoxFill className="h-4 w-4 ml-2" />,
    authorization_code: <PiDevicesFill className="h-4 w-4 ml-2" />,
    refresh_token: <RefreshCcw className="h-4 w-4 ml-2" />,
  };
  return iconMap[grantType];
};

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "id",
    header: i18n.t("label.application-id") || "Application ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center flex-nowrap whitespace-nowrap">
        {row.getValue("id")}
        {row.original.role === "internal_client" && (
          <RiVerifiedBadgeFill className="h-4 w-4 ml-2" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "displayName",
    header: i18n.t("label.display-name") || "Display Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("displayName")} </div>
    ),
  },
  {
    accessorKey: "role",
    header: i18n.t("label.role") || "Role",
    cell: ({ row }) => (
      <div className="capitalize flex items-center flex-nowrap whitespace-nowrap">
        {(row.getValue("role") as string).split("_").join(" ")}
      </div>
    ),
  },
  {
    accessorKey: "grants",
    header: i18n.t("label.grants") || "Grants",
    cell: ({ row }) => (
      <div className="flex items-center">
        {(row.getValue("grants") as any as string[])
          .sort()
          .map((grant: string) => (
            <div className="capitalize flex items-center" key={grant}>
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
