import { useMutation, useQueryClient } from "@tanstack/react-query";
import { liquid } from "@/service/liquid";

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await liquid.delegated.logout();
      return response.data;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
