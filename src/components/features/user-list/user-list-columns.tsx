import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import {
  PencilIcon,
  UserCogIcon,
  UserMinus,
  UserX,
  Verified,
} from "lucide-react";
import { HiSparkles } from "react-icons/hi";
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
    enableHiding: false,
    cell: ({ row }) => (
      <Link
        href={`/users/${row.original._id}`}
        className="flex items-center justify-start flex-nowrap whitespace-nowrap"
      >
        {row.getValue("username") || (
          <i className="opacity-50">Not available</i>
        )}
        &nbsp;
        {row.original.isSubscribed && (
          <Badge className="mr-2 capitalize" variant="outline">
            <HiSparkles />
            &nbsp;{row.original.subscriptionTier}
          </Badge>
        )}
        {row.original.verified && <Verified className="h-4 w-4" />}
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize flex items-center flex-nowrap whitespace-nowrap">
        {(row.getValue("role") as string).split("_").join(" ")}{" "}
        {(row.getValue("role") === "admin" ||
          row.getValue("role") === "super_admin") && (
          <UserCogIcon className="h-4 w-4 ml-2" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    header: "Restrictions",
    cell: ({ row }) => {
      const restricted = row.original.isRestricted;
      const banned = row.original.isBanned;
      return (
        <div className="flex gap-2">
          {restricted ? (
            <Badge variant={"secondary"} className="flex gap-1">
              <UserMinus className="h-4 w-4" />
              Restricted
            </Badge>
          ) : null}
          {banned ? (
            <Badge variant="destructive" className="flex gap-1">
              <UserX className="h-4 w-4 " />
              Banned
            </Badge>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "organization",
    header: "Organization",
    cell: ({ row }) => row.getValue("organization"),
  },
  {
    accessorKey: "followerCount",
    header: "Followers",
    cell: ({ row }) => row.getValue("followerCount"),
  },
  {
    accessorKey: "followingCount",
    header: "Following",
    cell: ({ row }) => row.getValue("followingCount"),
  },
  {
    accessorKey: "credits",
    header: "Credits",
    cell: ({ row }) => row.getValue("credits"),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Link href={`/users/${row.original._id}`}>
          <Button variant="outline">
            <PencilIcon className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
