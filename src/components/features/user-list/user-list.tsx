"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocation } from "wouter";

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
import UserBulkCreate from "../user-editor/user-bulk-create";
import { useTranslation } from "react-i18next";
import { useUsers, useUserSearch } from "@/hooks/api/use-users";

const UserList = function () {
  const [, setLocation] = useLocation();
  const [search, setSearch] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState("");

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

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    setSearch(inputValue === "" ? null : inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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

  const tableRows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => document.getElementById("page"),
    estimateSize: React.useCallback(() => 56, []),
    overscan: 10,
  });

  return (
    <div className="w-full h-full px-4 md:px-8 py-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {isPermissionAllowed("delegated:profile:search") && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              placeholder="Search users by name, email, username..."
              className="pl-9 pr-20 h-10 rounded-xl bg-card border-border/70 focus-visible:ring-primary/40"
              value={inputValue}
              onChange={onSearchChange}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2.5 text-xs font-semibold hover:bg-accent"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl px-3.5 border-border/70 bg-card/60 backdrop-blur-sm font-medium">
                {t("button.columns")} <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
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
          <UserBulkCreate />
          <UserCreate />
        </div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span>{t("message.total-users")}</span>
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 font-bold text-xs bg-primary/10 text-primary border border-primary/20">
            {totalUsers}
          </Badge>
        </div>
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
            <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="sticky top-0 z-10 backdrop-blur-md">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="text-sm font-semibold text-muted-foreground py-3">
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
                  {tableRows.length ? (
                    <>
                      {/* Virtual Spacer Top */}
                      {virtualizer.getVirtualItems().length > 0 && (
                        <tr>
                          <td
                            colSpan={table.getVisibleLeafColumns().length}
                            style={{
                              height: `${virtualizer.getVirtualItems()[0].start}px`,
                              padding: 0,
                              border: 0,
                            }}
                          />
                        </tr>
                      )}

                      {virtualizer.getVirtualItems().map((virtualRow) => {
                        const row = tableRows[virtualRow.index];
                        if (!row) return null;

                        return (
                          <TableRow
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            style={{ height: `${virtualRow.size}px` }}
                            className="cursor-pointer transition-colors hover:bg-primary/5 border-b border-border/40"
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.closest("button") || target.closest("a") || target.closest("input")) {
                                return;
                              }
                              setLocation(`/users/${row.original._id}`);
                            }}
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
                        );
                      })}

                      {/* Virtual Spacer Bottom */}
                      {virtualizer.getVirtualItems().length > 0 && (
                        <tr>
                          <td
                            colSpan={table.getVisibleLeafColumns().length}
                            style={{
                              height: `${virtualizer.getTotalSize() -
                                virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].end
                                }px`,
                              padding: 0,
                              border: 0,
                            }}
                          />
                        </tr>
                      )}

                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={userListColumns.length}
                        className="h-48 text-center p-0"
                      >
                        <EmptyState
                          title={t("message.nothing-to-show")}
                          description={t("message.no-users-found")}
                          icon={<Users className="w-5 h-5 text-muted-foreground" />}
                        />
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
