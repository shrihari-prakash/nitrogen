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
import axiosInstance from "@/service/axios";
import usePermissions from "@/hooks/use-permissions";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import { Badge } from "@/components/ui/badge";
import UserCreate from "../user-editor/user-create";
import { useTranslation } from "react-i18next";

const UserList = function () {
  const [search, setSearch] = React.useState(null);
  const { users, setUsers } = React.useContext(UsersContext);
  const { usersSearchResults, setUsersSearchResults } = React.useContext(
    UsersSearchResultsContext
  );
  const [hasMore, setHasMore] = React.useState(true);
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

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const getData = React.useCallback(async () => {
    console.log("called getdata");
    const limit = 100;
    const offset = users.length ? users[users.length - 1]._id : null;
    axiosInstance
      .get("/user/admin-api/list", { params: { limit: limit, offset: offset } })
      .then((response) => {
        const data = response.data.data;
        setUsers([...users, ...data.users] as User[]);
        setTotalUsers(data.totalUsers);
        console.log(data.totalUsers, users.length);
        if (data.totalUsers === users.length) {
          setHasMore(false);
        }
        localStorage.setItem("liquid_nitrogen_total_users", data.totalUsers);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setUsers, users]);

  React.useEffect(() => {
    if (!users.length) {
      setLoading(true);
      getData();
    } else {
      setLoading(false);
    }
  }, [users, setUsers, getData]);

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
    setSearch(e.target.value);
  };

  const onSearch = async () => {
    try {
      setLoading(true);
      const query = search;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (!query || query.length === 0) {
        return setUsersSearchResults(null);
      }
      const response = await axiosInstance.post("/user/admin-api/search", {
        query,
      });
      setUsersSearchResults(response.data.data.results);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (search || usersSearchResults) {
      setHasMore(false);
    } else {
      setHasMore(users.length < totalUsers);
    }
  }, [search, totalUsers, users.length, usersSearchResults]);

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
    <div className="w-full h-full px-4 md:px-8">
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
      {loading ? (
        <div
          className={`h-[calc(100%-124px)] w-full flex-1 flex items-center justify-center cursor-default relative`}
        >
          <Loader />
        </div>
      ) : (
        <>
          <InfiniteScroll
            dataLength={users.length}
            next={getData}
            scrollableTarget="page"
            hasMore={hasMore}
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
