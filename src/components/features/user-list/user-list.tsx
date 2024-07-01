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
import axiosInstance from "@/service/axios";
import { TypographyH4 } from "@/components/ui/typography";
import MeContext from "@/context/me-context";
import usePermissions from "@/hooks/use-permissions";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import { Badge } from "@/components/ui/badge";

const UserList = function () {
  const { me } = React.useContext(MeContext);
  const { users, setUsers } = React.useContext(UsersContext);
  const { usersSearchResults, setUsersSearchResults } = React.useContext(
    UsersSearchResultsContext
  );
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
  const [loading, setLoading] = React.useState<boolean>(
    users.length ? false : true
  );
  const [totalUsers, setTotalUsers] = React.useState<number>(
    parseInt(localStorage.getItem("liquid_nitrogen_total_users") || "0")
  );

  const isPermissionAllowed = usePermissions();

  const searchRef = React.useRef();

  React.useEffect(() => {
    if (!users.length) {
      setLoading(true);
      axiosInstance
        .get("/user/admin-api/list", { params: { limit: 250 } })
        .then((response) => {
          const data = response.data.data;
          setUsers(data.users as User[]);
          setTotalUsers(data.totalUsers);
          localStorage.setItem("liquid_nitrogen_total_users", data.totalUsers);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [users, setUsers]);

  React.useEffect(() => {
    localStorage.setItem(
      "nitrogen.user-list.column-visibility",
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  React.useEffect(() => {
    return () => setUsersSearchResults(null);
  }, [setUsersSearchResults]);

  const onSearchChange = (e: any) => {
    searchRef.current = e.target.value;
  };

  const onSearch = async () => {
    try {
      setLoading(true);
      const query = searchRef.current;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (!query || query.length === 0) {
        return setUsersSearchResults(null);
      }
      const response = await axiosInstance.post("/user/admin-api/search", { query });
      setUsersSearchResults(response.data.data.results);
    } finally {
      setLoading(false);
    }
  };

  const table = useReactTable({
    data: usersSearchResults || users,
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
    <div className="w-full h-full p-4 md:p-8">
      <TypographyH4 className="capitalize">Hello, {(me as User).firstName}</TypographyH4>
      <div className="flex items-center py-4">
        {isPermissionAllowed("delegated:profile:search") && (
          <>
            <Input
              placeholder="Search users..."
              className="max-w-sm"
              onChange={onSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
            />
            <Button variant="outline" className="mx-2" onClick={onSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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
      <div className="flex mb-4 font-medium">
        Total users:{" "}
        <Badge variant="secondary" className="ml-2 font-medium">
          {totalUsers}
        </Badge>
      </div>
      {loading ? (
        <div
          className={`h-[calc(100%-124px)] w-full flex-1 flex items-center justify-center cursor-default relative`}
        >
          <Loader />
        </div>
      ) : (
        <>
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
                      Nothing to show.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserList;
