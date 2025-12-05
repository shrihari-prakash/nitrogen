import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/service/axios";
import { Scope } from "@/components/ui/scope-selector";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await axiosInstance.get("/system/settings");
      return response.data.data.settings;
    },
  });
};

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosInstance.get("/system/countries-insecure");
      return response.data.data.countries;
    },
  });
};

export const useRoles = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axiosInstance.get("/roles/list");
      return response.data.data.roles;
    },
    enabled,
  });
};

export const useScopes = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["scopes"],
    queryFn: async () => {
      const response = await axiosInstance.get("/user/scopes");
      const scopesObject = response.data.data.scopes;
      return Object.keys(scopesObject).map(
        (key) => scopesObject[key]
      ) as Scope[];
    },
    enabled,
  });
};

export const useEditableFields = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["editableFields"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/user/admin-api/editable-fields"
      );
      return response.data.data.editableFields;
    },
    enabled,
  });
};

export const useSubscriptionTiers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["subscriptionTiers"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/user/admin-api/subscription-tiers"
      );
      return response.data.data.subscriptionTiers;
    },
    enabled,
  });
};
