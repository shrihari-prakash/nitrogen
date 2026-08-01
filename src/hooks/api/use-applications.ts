import { useQuery } from "@tanstack/react-query";
import { liquid } from "@/service/liquid";
import { Application } from "@/types/application";

export const useApplications = () => {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await liquid.admin.oauth.listClients({ limit: 50 });
      return (response.data as any)?.data?.clients as Application[];
    },
  });
};
