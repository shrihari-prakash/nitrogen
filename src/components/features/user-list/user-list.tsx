"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userListColumns } from "./user-list-columns";
import { User } from "@/types/user";
import usePermissions from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";
import UserCreate from "../user-editor/user-create";
import { useTranslation } from "react-i18next";
import { useUsers, useUserSearch } from "@/hooks/api/use-users";

const UserList = function () {
  const [search, setSearch] = React.useState<string | null>(null);

  const {
    data: usersData,
    fetchNextPage,
    hasNextPage,
    isLoading: isUsersLoading,
  } = useUsers();

  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(search);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  let savedColumnVisibilityState = localStorage.getItem(
    "nitrogen.user-list.column-visibility"
  );
  if (savedColumnVisibilityState) {
    savedColumnVisibilityState = JSON.parse(savedColumnVisibilityState);
  }
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      (savedColumnVisibilityState as unknown as VisibilityState) || {
        followingCount: false,
        followerCount: false,
        credits: false,
      }
    );

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const users = React.useMemo(() => {
    if (usersData) {
      return usersData.pages.flatMap((page) => page.users) as User[];
    }
    return [];
  }, [usersData]);

  const totalUsers = React.useMemo(() => {
    if (usersData && usersData.pages.length > 0) {
      return usersData.pages[usersData.pages.length - 1].totalUsers;
    }
    return 0;
  }, [usersData]);

  const displayData = searchResults || users;
  const loading = isUsersLoading || isSearchLoading;

  React.useEffect(() => {
    localStorage.setItem(
      "nitrogen.user-list.column-visibility",
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  const onSearchChange = (e: any) => {
    const value = e.target.value;
    setSearch(value === "" ? null : value);
  };

  const table = useReactTable({
    data: displayData,
    columns: userListColumns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full h-full px-4 md:px-8">
      <div className="flex items-center py-4">
        {isPermissionAllowed("delegated:profile:search") && (
          <>
            <Input
              placeholder="Search users..."
              className="max-w-sm"
              onChange={onSearchChange}
            />
            <Button variant="outline" className="mx-2">
              <Search className="h-4 w-4" />
            </Button>
          </>
        )}
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
      </div>
      <div className="flex justify-between items-center my-4 ml-auto gap-2">
        <div className="flex font-medium">
          {t("message.total-users")}{" "}
          <Badge variant="secondary" className="ml-2 font-medium">
            {totalUsers}
          </Badge>
        </div>
        <UserCreate />
      </div>
      {loading && !displayData.length ? (
        <div
          className={`h-[calc(100%-124px)] w-full flex-1 flex items-center justify-center cursor-default relative`}
        >
          <Loader />
        </div>
      ) : (
        <>
          <InfiniteScroll
            dataLength={displayData.length}
            next={fetchNextPage}
            scrollableTarget="page"
            hasMore={!!hasNextPage && !searchResults}
            loader={
              <div className="h-20">
                <Loader />
              </div>
            }
          >
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
                        colSpan={userListColumns.length}
                        className="h-24 text-center"
                      >
                        {t("message.nothing-to-show")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </InfiniteScroll>
        </>
      )}
    </div>
  );
};

export default UserList;
