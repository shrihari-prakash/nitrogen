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
import { ChevronDown, Box, Search, X, Shield, Laptop } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { applicationListColumns } from "./application-list-columns";
import { Application } from "@/types/application";
import ApplicationEditor from "../application-editor/application-editor";
import ScopesContext from "@/context/scopes-context";
import { useTranslation } from "react-i18next";
import { useApplications } from "@/hooks/api/use-applications";

const ApplicationList = function () {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "internal_client" | "external_client">("all");

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  let savedColumnVisibilityState = localStorage.getItem(
    "nitrogen.application-list.column-visibility"
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

  const { data: applicationsData, isLoading: loading } = useApplications();
  const [applications, setApplications] = React.useState<Application[]>([]);

  React.useEffect(() => {
    if (applicationsData) {
      setApplications(applicationsData);
    }
  }, [applicationsData]);

  const { scopes, refreshScopes } = React.useContext(ScopesContext);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!scopes) refreshScopes();
  }, [scopes, refreshScopes]);

  React.useEffect(() => {
    localStorage.setItem(
      "nitrogen.application-list.column-visibility",
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  const onApplicationCreate = (application: Application) => {
    setApplications((apps) => [...apps, application]);
  };

  const onApplicationDelete = (_id: string) => {
    setApplications((apps) => apps.filter((app) => app._id !== _id));
  };

  // Filtered applications
  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = app.displayName?.toLowerCase().includes(q);
        const matchId = app.id?.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }

      // Role Filter
      if (roleFilter !== "all" && app.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, roleFilter]);

  const isFiltered = searchQuery !== "" || roleFilter !== "all";

  const table = useReactTable({
    data: filteredApplications,
    columns: applicationListColumns,
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
      onApplicationDelete,
      onApplicationUpdate: (application: Application) => {
        const newApplications = applications.map((app: Application) =>
          app.id === application.id ? { ...app, ...application } : app
        );
        setApplications(() => newApplications);
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
            placeholder={t("placeholder.search-applications")}
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
              onClick={() => setRoleFilter("all")}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors text-center justify-center ${
                roleFilter === "all"
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("filter.all-types")}
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("internal_client")}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                roleFilter === "internal_client"
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{t("filter.internal")}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("external_client")}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                roleFilter === "external_client"
                  ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 shrink-0" />
              <span>{t("filter.external")}</span>
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

            {/* Application Editor Trigger */}
            <ApplicationEditor onCreate={onApplicationCreate} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="h-[400px] w-full flex items-center justify-center relative">
          <Loader />
        </div>
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
                    colSpan={applicationListColumns.length}
                    className="h-64 text-center p-0"
                  >
                    <EmptyState
                      title={isFiltered ? t("message.no-matching-applications") : t("message.nothing-to-show")}
                      description={
                        isFiltered
                          ? t("message.no-apps-filter-help")
                          : t("message.no-applications-found")
                      }
                      icon={<Box className="w-6 h-6 text-muted-foreground" />}
                    />
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

export default ApplicationList;

