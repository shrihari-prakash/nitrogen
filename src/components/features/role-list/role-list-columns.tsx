import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { RoleListActions } from "./role-list-actions";
import { MdLocalPolice } from "react-icons/md";

export const roleListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex gap-1 items-center flex-nowrap whitespace-nowrap">
        {row.getValue("id")}
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
    accessorKey: "ranking",
    header: "Rank",
    cell: ({ row }) => (
      <div className="flex items-center">
        <MdLocalPolice className="mr-1" />
        {row.getValue("ranking")}
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
