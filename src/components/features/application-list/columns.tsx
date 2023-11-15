import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { Asterisk, EyeIcon, MoreHorizontal, Verified } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "id",
    header: "ID",
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
    accessorKey: "secret",
    header: "Secret",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [show, setShow] = useState(false);
      return (
        <div className="w-40">
          {show ? (
            <div
              onMouseLeave={() => setShow(false)}
              className="whitespace-nowrap"
            >
              {row.getValue("secret")}
            </div>
          ) : (
            <div
              onMouseEnter={() => setShow(true)}
              className="flex items-center"
            >
              <Asterisk /> <Asterisk /> <Asterisk /> <Asterisk /> <EyeIcon />
            </div>
          )}
        </div>
      );
    },
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
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <Link href={`/applications/${row.original.id}`}>
              <DropdownMenuItem>
                Edit
                <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
