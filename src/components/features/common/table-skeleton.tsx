import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

export type TableSkeletonType = "user" | "role" | "application";

interface TableSkeletonProps {
  type: TableSkeletonType;
  rows?: number;
  className?: string;
}

export const UserTableRowSkeleton = ({ index = 0 }: { index?: number }) => {
  // Vary text widths slightly per row for realistic organic loading appearance
  const nameWidths = ["w-24", "w-28", "w-20", "w-32", "w-26"];
  const emailWidths = ["w-36", "w-44", "w-32", "w-40", "w-48"];
  const roleWidths = ["w-16", "w-20", "w-24", "w-18", "w-22"];

  const nameW = nameWidths[index % nameWidths.length];
  const emailW = emailWidths[index % emailWidths.length];
  const roleW = roleWidths[index % roleWidths.length];

  return (
    <TableRow className="border-b border-border/40 hover:bg-transparent">
      {/* Avatar */}
      <TableCell className="py-3.5 pl-4 w-12">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      </TableCell>
      {/* Username */}
      <TableCell className="py-3.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className={`h-4 ${nameW}`} />
          {index % 2 === 0 && <Skeleton className="h-4 w-12 rounded-full" />}
        </div>
      </TableCell>
      {/* First Name */}
      <TableCell className="py-3.5">
        <Skeleton className={`h-4 ${nameW}`} />
      </TableCell>
      {/* Last Name */}
      <TableCell className="py-3.5">
        <Skeleton className={`h-4 ${nameW}`} />
      </TableCell>
      {/* Role */}
      <TableCell className="py-3.5">
        <Skeleton className={`h-6 ${roleW} rounded-md`} />
      </TableCell>
      {/* Email */}
      <TableCell className="py-3.5">
        <Skeleton className={`h-4 ${emailW}`} />
      </TableCell>
      {/* Actions */}
      <TableCell className="py-3.5 pr-4 text-right">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const RoleTableRowSkeleton = ({ index = 0 }: { index?: number }) => {
  const titleWidths = ["w-28", "w-36", "w-24", "w-40", "w-32"];
  const descWidths = ["w-64", "w-80", "w-56", "w-72", "w-48"];

  const titleW = titleWidths[index % titleWidths.length];
  const descW = descWidths[index % descWidths.length];

  return (
    <TableRow className="border-b border-border/40 hover:bg-transparent">
      {/* Rank */}
      <TableCell className="py-3.5 pl-4 w-20">
        <Skeleton className="h-6 w-12 rounded-md" />
      </TableCell>
      {/* Role Name & ID */}
      <TableCell className="py-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className={`h-4 ${titleW}`} />
            <Skeleton className="h-4 w-14 rounded-md" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      {/* Target Type */}
      <TableCell className="py-3.5 w-28">
        <Skeleton className="h-6 w-20 rounded-md" />
      </TableCell>
      {/* Description */}
      <TableCell className="py-3.5">
        <Skeleton className={`h-4 ${descW}`} />
      </TableCell>
      {/* Actions */}
      <TableCell className="py-3.5 pr-4 text-right">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const ApplicationTableRowSkeleton = ({ index = 0 }: { index?: number }) => {
  const nameWidths = ["w-32", "w-40", "w-28", "w-48", "w-36"];
  const nameW = nameWidths[index % nameWidths.length];

  return (
    <TableRow className="border-b border-border/40 hover:bg-transparent">
      {/* Application Name & ID */}
      <TableCell className="py-3.5 pl-4 min-w-[200px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className={`h-4 ${nameW}`} />
            {index % 2 === 0 && <Skeleton className="h-4 w-14 rounded-md" />}
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      </TableCell>
      {/* Client Type */}
      <TableCell className="py-3.5 w-36">
        <Skeleton className="h-6 w-24 rounded-md" />
      </TableCell>
      {/* Grants */}
      <TableCell className="py-3.5 min-w-[180px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-28 rounded-md" />
          {index % 2 === 1 && <Skeleton className="h-5 w-20 rounded-md" />}
        </div>
      </TableCell>
      {/* Actions */}
      <TableCell className="py-3.5 pr-4 text-right">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function TableSkeleton({
  type,
  rows = 6,
  className = "",
}: TableSkeletonProps) {
  const { t } = useTranslation();

  const renderHeaders = () => {
    switch (type) {
      case "user":
        return (
          <TableRow className="hover:bg-transparent border-b border-border/60">
            <TableHead className="w-12 pl-4" />
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.username") || "Username"}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.first-name") || "First Name"}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.last-name") || "Last Name"}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.role") || "Role"}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.email") || "Email"}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pr-4 text-right">
              {t("label.actions") || "Actions"}
            </TableHead>
          </TableRow>
        );

      case "role":
        return (
          <TableRow className="hover:bg-transparent border-b border-border/60">
            <TableHead className="w-20 pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              Rank
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              Role Name
            </TableHead>
            <TableHead className="w-28 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              Target Type
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              Description
            </TableHead>
            <TableHead className="w-16 pr-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5" />
          </TableRow>
        );

      case "application":
        return (
          <TableRow className="hover:bg-transparent border-b border-border/60">
            <TableHead className="pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.display-name") || "Application Name"}
            </TableHead>
            <TableHead className="w-36 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.role") || "Client Type"}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
              {t("label.grants") || "Grants"}
            </TableHead>
            <TableHead className="w-16 pr-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5" />
          </TableRow>
        );
    }
  };

  const renderRow = (idx: number) => {
    switch (type) {
      case "user":
        return <UserTableRowSkeleton key={idx} index={idx} />;
      case "role":
        return <RoleTableRowSkeleton key={idx} index={idx} />;
      case "application":
        return <ApplicationTableRowSkeleton key={idx} index={idx} />;
    }
  };

  return (
    <div
      className={`rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden animate-in fade-in-50 duration-200 ${className}`}
    >
      <Table>
        <TableHeader className="bg-muted/40 backdrop-blur-md">
          {renderHeaders()}
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, idx) => renderRow(idx))}
        </TableBody>
      </Table>
    </div>
  );
}
