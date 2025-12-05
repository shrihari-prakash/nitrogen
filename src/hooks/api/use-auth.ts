import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/service/axios";

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.get("/user/logout", {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
