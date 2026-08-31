"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ShieldAlert,
  Search,
  X,
  RotateCcw,
  User,
  Laptop,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TableSkeleton from "@/components/features/common/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ScopesContext from "@/context/scopes-context";
import { roleListColumns } from "./role-list-columns";
import { Role } from "@/types/role";
import RoleEditor from "../role-editor/role-editor";
import { useTranslation } from "react-i18next";
import { useRolesList } from "@/hooks/api/use-roles";

const RoleList = function () {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "user" | "client">("all");
  const [categoryFilter, setCategoryFilter] = React.useState<"all" | "system" | "custom">("all");

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  let savedColumnVisibilityState = localStorage.getItem(
    "nitrogen.role-list.column-visibility"
  );
  if (savedColumnVisibilityState) {
    try {
      savedColumnVisibilityState = JSON.parse(savedColumnVisibilityState);
    } catch {
      savedColumnVisibilityState = null;
    }
  }

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      (savedColumnVisibilityState as unknown as VisibilityState) || {}
    );

  const { data: rolesData, isLoading: loading } = useRolesList();
  const [roles, setRoles] = React.useState<Role[]>([]);

  React.useEffect(() => {
    if (rolesData) {
      setRoles(rolesData);
    }
  }, [rolesData]);

  React.useEffect(() => {
    localStorage.setItem(
      "nitrogen.role-list.column-visibility",
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  const { scopes, refreshScopes } = React.useContext(ScopesContext);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!scopes) refreshScopes();
  }, [scopes, refreshScopes]);

  const onRoleCreate = (role: Role) => {
    setRoles((prev) => [...prev, role]);
  };

  const onRoleDelete = (id: string) => {
    setRoles((prev) => prev.filter((app) => app.id !== id));
  };

  // Filtered Roles
  const filteredRoles = React.useMemo(() => {
    return roles.filter((role) => {
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = role.displayName?.toLowerCase().includes(q);
        const matchId = role.id?.toLowerCase().includes(q);
        const matchDesc = role.description?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDesc) return false;
      }

      // Type Filter
      if (typeFilter !== "all" && (role.type || "user") !== typeFilter) {
        return false;
      }

      // System vs Custom Category Filter
      if (categoryFilter === "system" && !role.system) return false;
      if (categoryFilter === "custom" && role.system) return false;

      return true;
    });
  }, [roles, searchQuery, typeFilter, categoryFilter]);

  const isFiltered = searchQuery !== "" || typeFilter !== "all" || categoryFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
  };

  const table = useReactTable({
    data: filteredRoles,
    columns: roleListColumns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
    meta: {
      scopes,
      onRoleDelete: onRoleDelete,
      onRoleUpdate: (updatedRole: Role) => {
        setRoles((prev) =>
          prev.map((r) => (r.id === updatedRole.id ? updatedRole : r))
        );
      },
    },
  });

  return (
    <div className="w-full h-full px-4 md:px-8 py-4 space-y-4">
      {/* Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full lg:max-w-xs xl:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            placeholder={t("placeholder.search-roles")}
            className="pl-9 pr-9 h-9 rounded-lg bg-card border-border/70 focus-visible:ring-primary/40 text-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and Actions Controls Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2.5 w-full lg:w-auto">
          {/* Target Type Filter Segment - Full Width on Mobile, Auto on Desktop */}
          <div className="flex items-center bg-muted/50 border border-border/80 rounded-lg p-1 gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors text-center justify-center ${
                typeFilter === "all"
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("filter.all-types")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("user")}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                typeFilter === "user"
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{t("filter.user")}</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("client")}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                typeFilter === "client"
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 shrink-0" />
              <span>{t("filter.client")}</span>
            </button>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* Columns Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 px-3 gap-1.5 shrink-0">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  <span>{t("button.columns")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Editor Trigger */}
            <RoleEditor onCreate={onRoleCreate} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <TableSkeleton type="role" rows={6} />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <Table className="overflow-y-auto">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition-colors hover:bg-primary/5 border-b border-border/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={roleListColumns.length}
                    className="h-64 text-center p-0"
                  >
                    <EmptyState
                      title={isFiltered ? t("message.no-matching-roles") : t("message.nothing-to-show")}
                      description={
                        isFiltered
                          ? t("message.no-roles-filter-help")
                          : t("message.no-roles-found")
                      }
                      icon={<ShieldAlert className="w-6 h-6 text-muted-foreground" />}
                    >
                      {isFiltered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          {t("button.reset")}
                        </Button>
                      )}
                    </EmptyState>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RoleList;

