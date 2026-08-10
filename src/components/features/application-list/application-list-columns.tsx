import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, Shield, Laptop, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ApplicationListActions } from "./application-list-actions";
import i18n from "i18next";
import { useState } from "react";

const CopyIdButton = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast(i18n.t("message.copied-application-id") || "Application ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(i18n.t("message.copy-failed") || "Copy failed");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-5 w-5 text-muted-foreground hover:text-foreground p-0"
      title={i18n.t("action.copy-application-id") || "Copy ID"}
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "displayName",
    header: i18n.t("label.display-name") || "Application Name",
    cell: ({ row }) => {
      const isInternal = row.original.role === "internal_client";
      return (
        <div className="flex flex-col gap-1 py-0.5 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm tracking-tight">
              {row.getValue("displayName")}
            </span>
            {isInternal && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                Internal
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <span>{row.original.id}</span>
            <CopyIdButton id={row.original.id} />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: i18n.t("label.role") || "Client Type",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isInternal = role === "internal_client";

      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-2.5 py-0.5 text-xs font-normal rounded-md text-muted-foreground bg-muted/30 border-border/70 whitespace-nowrap select-none"
        >
          {isInternal ? (
            <Shield className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className="text-foreground font-medium capitalize">
            {role.split("_").join(" ")}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "grants",
    header: i18n.t("label.grants") || "Grants",
    cell: ({ row }) => {
      const grants = (row.getValue("grants") as string[]) || [];

      return (
        <div className="flex items-center gap-1.5 flex-wrap min-w-[180px]">
          {grants.map((grant) => (
            <Badge
              key={grant}
              variant="outline"
              className="text-[11px] font-mono font-normal px-2 py-0.5 bg-muted/40 text-muted-foreground border-border/60 whitespace-nowrap select-none"
            >
              {grant.split("_").join(" ")}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ApplicationListActions,
  },
];

