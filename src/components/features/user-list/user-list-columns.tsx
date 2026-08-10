import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "wouter";
import i18n from "i18next";
import { Shield, User as UserIcon, Sparkles, BadgeCheck, UserMinus, UserX, Pencil, Users, UserCheck, Coins } from "lucide-react";

export const userListColumns: ColumnDef<User>[] = [
  {
    accessorKey: "ProfilePicture",
    header: "",
    id: "profilePicture",
    cell: ({ row }) => (
      <Avatar className="h-10 w-10 border border-border/60">
        <AvatarImage src={row.original.profilePictureUrl} />
        <AvatarFallback className="text-xs font-semibold bg-muted">
          {row.original.firstName
            ? row.original.firstName.charAt(0) + row.original.lastName.charAt(0)
            : row.original.name && row.original.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "username",
    header: i18n.t("label.username") || "Username",
    id: "username",
    enableHiding: false,
    cell: ({ row }) => (
      <Link
        href={`/users/${row.original._id}`}
        className="flex items-center justify-start flex-nowrap whitespace-nowrap font-medium text-foreground hover:text-primary transition-colors"
      >
        <span>
          {row.getValue("username") || (
            <i className="opacity-50 text-muted-foreground">{i18n.t("message.not-available")}</i>
          )}
        </span>
        {row.original.isSubscribed && (
          <Badge className="ml-1.5 capitalize text-[10px] px-1.5 py-0" variant="outline">
            <Sparkles className="mr-0.5 h-3 w-3" />
            {row.original.subscriptionTier}
          </Badge>
        )}
        {row.original.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary ml-1" />}
      </Link>
    ),
  },
  {
    accessorKey: "firstName",
    header: i18n.t("label.first-name") || "First Name",
    id: "firstName",
    cell: ({ row }) => (
      <div className="capitalize font-medium text-foreground">
        {row.getValue("firstName") ||
          ((row.original.name || "") as string).split(" ")[0]}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
    header: i18n.t("label.last-name") || "Last Name",
    id: "lastName",
    cell: ({ row }) => (
      <div className="capitalize text-muted-foreground">
        {row.getValue("lastName") ||
          ((row.original.name || "") as string).split(" ")[1]}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: i18n.t("label.role") || "Role",
    id: "role",
    cell: ({ row }) => {
      const roleStr = (row.getValue("role") as string) || "user";
      const isAdmin = roleStr === "admin" || roleStr === "super_admin";
      const formattedRole = roleStr.split("_").join(" ");

      return (
        <Badge
          variant={isAdmin ? "secondary" : "outline"}
          className={`gap-1.5 px-2.5 py-0.5 text-xs font-normal capitalize rounded-md ${isAdmin
            ? "font-medium"
            : "text-muted-foreground bg-muted/30 border-border/70"
            }`}
        >
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 text-primary" />
          ) : (
            <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span>{formattedRole}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: i18n.t("label.email") || "Email",
    id: "email",
    cell: ({ row }) => <div className="lowercase text-muted-foreground">{row.getValue("email")}</div>,
  },
  {
    header: i18n.t("label.restrictions") || "Restrictions",
    id: "restrictions",
    cell: ({ row }) => {
      const restricted = row.original.isRestricted;
      const banned = row.original.isBanned;
      return (
        <div className="flex gap-1.5">
          {restricted ? (
            <Badge variant="secondary" className="flex gap-1 text-[11px] px-2 py-0.5 font-medium">
              <UserMinus className="h-3 w-3 text-muted-foreground" />
              Restricted
            </Badge>
          ) : null}
          {banned ? (
            <Badge variant="outline" className="flex gap-1 text-[11px] px-2 py-0.5 font-medium border-red-600/30 text-red-600 dark:text-red-400">
              <UserX className="h-3 w-3" />
              Banned
            </Badge>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "organization",
    header: i18n.t("label.organization") || "Organization",
    id: "organization",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("organization") || "-"}</div>,
  },
  {
    accessorKey: "followerCount",
    header: i18n.t("label.followers") || "Followers",
    id: "followerCount",
    cell: ({ row }) => {
      const count = (row.getValue("followerCount") as number) || 0;
      return (
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Users className="w-3.5 h-3.5 opacity-60" />
          <span>{count.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "followingCount",
    header: i18n.t("label.following") || "Following",
    id: "followingCount",
    cell: ({ row }) => {
      const count = (row.getValue("followingCount") as number) || 0;
      return (
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <UserCheck className="w-3.5 h-3.5 opacity-60" />
          <span>{count.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "credits",
    header: i18n.t("label.credits") || "Credits",
    id: "credits",
    cell: ({ row }) => {
      const credits = (row.getValue("credits") as number) || 0;
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-mono text-xs font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 whitespace-nowrap"
        >
          <Coins className="w-3 h-3 text-pink-500" />
          <span>{credits.toLocaleString()}</span>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <Link href={`/users/${row.original._id}`}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-border/70 hover:bg-accent transition-colors"
              title={i18n.t("action.edit-user") || "Edit User"}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

