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
import { ChevronDown } from "lucide-react";

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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  let savedColumnVisibilityState = localStorage.getItem(
    "nitrogen.application-list.column-visibility"
  );
  if (savedColumnVisibilityState) {
    savedColumnVisibilityState = JSON.parse(savedColumnVisibilityState);
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

  const table = useReactTable({
    data: applications,
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
        console.log("on up[date.");
        const newApplications = applications.map((app: Application) =>
          app.id === application.id ? { ...app, ...application } : app
        );
        setApplications(() => newApplications);
      },
    },
  });

  return (
    <div className="w-full h-full px-4 md:px-8">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {t("button.columns")} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
        <ApplicationEditor onCreate={onApplicationCreate} />
      </div>
      {loading ? (
        <div
          className={`h-[calc(100%-100px)] w-full flex-1 flex items-center justify-center cursor-default relative`}
        >
          <Loader />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table className="overflow-y-auto">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    className="h-24 text-center"
                  >
                    Nothing to show.
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
