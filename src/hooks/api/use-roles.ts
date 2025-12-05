import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/service/axios";
import { Role } from "@/types/role";

export const useRolesList = () => {
  return useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      const response = await axiosInstance.get("/roles/list", {
        params: { limit: 50 },
      });
      const apiRoles = response.data.data.roles as Role[];
      return apiRoles.sort((a, b) => a.ranking - b.ranking);
    },
  });
};
