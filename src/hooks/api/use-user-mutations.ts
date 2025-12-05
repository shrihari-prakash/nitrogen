import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/service/axios";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.patch(
        "/user/admin-api/update",
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        "/user/admin-api/subscription",
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateCustomData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.put(
        "/user/admin-api/custom-data",
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        "/user/admin-api/credits",
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post("/user/admin-api/verify", data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post("/user/admin-api/ban", data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useRestrictUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        "/user/admin-api/restrict",
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.target] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post("/user/admin-api/access", data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      if (variables.targets && variables.targets.length > 0) {
        variables.targets.forEach((target: string) => {
          queryClient.invalidateQueries({ queryKey: ["user", target] });
        });
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};
