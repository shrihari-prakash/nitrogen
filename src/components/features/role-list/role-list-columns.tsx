import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { RoleListActions } from "./role-list-actions";
import { RiShieldFill } from "react-icons/ri";

export const roleListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "ranking",
    header: "Rank",
    cell: ({ row }) => (
      <div className="flex items-center relative">
        <div className="w-8 h-8 relative select-none">
          <RiShieldFill className="h-8 w-8" />
          <span
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-background font-mono ${
              String(row.getValue("ranking")).length === 3
                ? "text-xs"
                : "text-sm"
            }`}
          >
            {row.getValue("ranking")}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => (
      <div className="capitalize break-keep flex flex-col flex-nowrap whitespace-nowrap">
        <div className="flex gap-1 items-center flex-nowrap whitespace-nowrap text-xs opacity-70">
          #&nbsp;{row.original.id}
        </div>
        {row.getValue("displayName")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="opacity-50">{row.getValue("description")} </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: RoleListActions,
  },
];
