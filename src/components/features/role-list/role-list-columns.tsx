import { ColumnDef } from "@tanstack/react-table";
import { RoleListActions } from "./role-list-actions";
import { Role } from "@/types/role";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Sparkles,
  User,
  Laptop,
  Shield,
  Crown,
} from "lucide-react";

export const roleListColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "ranking",
    header: "Rank",
    cell: ({ row }) => {
      const rank = Number(row.getValue("ranking"));

      const isTopRank = rank === 1;

      return (
        <div className="flex items-center gap-1.5" title={`Hierarchy Rank: ${rank}`}>
          <Badge
            variant="outline"
            className={`px-2 py-0.5 flex items-center gap-1 rounded-md text-xs font-mono select-none ${isTopRank
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                : "bg-muted/60 text-muted-foreground border-border/70 font-medium"
              }`}
          >
            {isTopRank ? (
              <Crown className="h-3 w-3 text-amber-500 fill-amber-500/20" />
            ) : (
              <Shield className="h-3 w-3 text-muted-foreground" />
            )}
            <span>#{rank}</span>
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "displayName",
    header: "Role Name",
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="flex flex-col gap-0.5 py-0.5 min-w-[160px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground text-sm tracking-tight">
              {row.getValue("displayName")}
            </span>
            {role.system ? (
              <Badge
                variant="secondary"
                className="gap-1 text-[10px] px-1.5 py-0 font-medium rounded-md"
              >
                <Lock className="w-2.5 h-2.5 text-muted-foreground" /> System
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 text-[10px] px-1.5 py-0 font-medium rounded-md text-muted-foreground"
              >
                <Sparkles className="w-2.5 h-2.5 text-muted-foreground" /> Custom
              </Badge>
            )}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {role.id}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Target Type",
    cell: ({ row }) => {
      const type = (row.getValue("type") as string) || "user";
      const isUser = type === "user";

      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-2.5 py-0.5 text-xs font-normal capitalize rounded-md text-muted-foreground bg-muted/30 border-border/70 whitespace-nowrap select-none"
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className="text-foreground font-medium">{type}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string;
      if (!desc) {
        return (
          <span className="text-muted-foreground/40 italic text-xs">
            No description
          </span>
        );
      }
      return (
        <span
          className="text-muted-foreground line-clamp-2 max-w-sm"
          title={desc}
        >
          {desc}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: RoleListActions,
  },
];

