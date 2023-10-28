import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Link } from "wouter";

export const userListColumns: ColumnDef<User>[] = [
  {
    accessorKey: "ProfilePicture",
    header: "",
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.profilePictureUrl} />
        <AvatarFallback>
          {row.original.firstName
            ? row.original.firstName.charAt(0) + row.original.lastName.charAt(0)
            : row.original.name && row.original.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <Link href={`/users/${row.original._id}`}>
        {row.getValue("username") || (
          <i className="opacity-50">Not available</i>
        )}
      </Link>
    ),
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("firstName") ||
          ((row.original.name || "") as string).split(" ")[0]}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("lastName") ||
          ((row.original.name || "") as string).split(" ")[1]}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      console.log(row);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <Link href={`/users/${row.original._id}`}>
              <DropdownMenuItem>
                Edit
                <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => null}>
              {row.original.isBanned ? "Unban User" : "Suspend User"}
              <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
