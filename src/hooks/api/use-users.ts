import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";

export const useUsers = (limit: number = 100) => {
  return useInfiniteQuery({
    queryKey: ["users"],
    queryFn: async ({ pageParam = null }) => {
      const params: any = { limit };
      if (pageParam) {
        params.offset = pageParam;
      }
      const response = await axiosInstance.get("/user/admin-api/list", {
        params,
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.users.length < limit) return undefined;
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
      const response = await axiosInstance.post("/user/admin-api/search", {
        query,
      });
      return response.data.data.results as User[];
    },
    enabled: !!query && query.length > 0,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: any) => {
      const response = await axiosInstance.post("/user/admin-api/create", [
        user,
      ]);
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
      const response = await axiosInstance.post(
        "/user/admin-api/retrieve-user-info",
        {
          targets: [id],
        }
      );
      return response.data.data.users[0];
    },
    enabled: !!id,
  });
};

export const useLoginHistory = (userId: string) => {
  return useQuery({
    queryKey: ["loginHistory", userId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/user/admin-api/login-history",
        {
          params: {
            target: userId,
          },
        }
      );
      return response.data.data.records;
    },
    enabled: !!userId,
  });
};
