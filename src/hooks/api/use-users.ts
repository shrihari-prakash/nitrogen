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
      return response.data as any;
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
      return (response.data as any)?.results as User[];
    },
    enabled: !!query && query.length > 0,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: any) => {
      const payload = Array.isArray(user) ? user : [user];
      const response: any = await liquid.admin.users.create(payload as any);
      
      const resData: any = response?.data || response;
      if (response?.ok === false || resData?.ok === 0 || resData?.error || resData?.ok === false) {
        const errorObj: any = new Error(
          resData?.error || resData?.message || "Failed to create user"
        );
        errorObj.response = { data: resData };
        errorObj.data = resData;
        throw errorObj;
      }
      
      return resData;
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
      return (response.data as any)?.users?.[0];
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
      return (response.data as any)?.records;
    },
    enabled: !!userId,
  });
};
