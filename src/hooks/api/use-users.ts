import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { liquid } from "@/service/liquid";
import { User } from "@/types/user";

export const useUsers = (limit: number = 100) => {
  return useInfiniteQuery({
    queryKey: ["users"],
    queryFn: async ({ pageParam = null }) => {
      const params: any = { limit };
      if (pageParam) {
        params.offset = pageParam;
      }
      const response = await liquid.admin.users.list(params);
      return (response.data as any)?.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.users || lastPage.users.length < limit) return undefined;
      return lastPage.users[lastPage.users.length - 1]._id;
    },
    initialPageParam: null,
  });
};

export const useUserSearch = (query: string | null) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: async () => {
      if (!query) return null;
      const response = await liquid.admin.users.search({ query });
      return (response.data as any)?.data?.results as User[];
    },
    enabled: !!query && query.length > 0,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: any) => {
      const response = await liquid.admin.users.create(user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await liquid.admin.users.retrieveInfo({
        targets: [id],
      });
      return (response.data as any)?.data?.users?.[0];
    },
    enabled: !!id,
  });
};

export const useLoginHistory = (userId: string) => {
  return useQuery({
    queryKey: ["loginHistory", userId],
    queryFn: async () => {
      const response = await liquid.admin.users.getLoginHistory({
        target: userId,
      });
      return (response.data as any)?.data?.records;
    },
    enabled: !!userId,
  });
};
