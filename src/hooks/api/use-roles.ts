import { useQuery } from "@tanstack/react-query";
import { liquid } from "@/service/liquid";
import { Role } from "@/types/role";

export const useRolesList = () => {
  return useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      const response = await liquid.roles.list({ limit: 50 });
      const apiRoles = ((response.data as any)?.data?.roles || []) as Role[];
      return apiRoles.sort((a, b) => a.ranking - b.ranking);
    },
  });
};
