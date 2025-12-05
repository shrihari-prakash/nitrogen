import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/service/axios";
import { Application } from "@/types/application";

export const useApplications = () => {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await axiosInstance.get("/client/admin-api/list", {
        params: { limit: 50 },
      });
      return response.data.data.clients as Application[];
    },
  });
};
