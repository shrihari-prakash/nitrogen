import { useQuery } from "@tanstack/react-query";
import { liquid } from "@/service/liquid";
import { Scope } from "@/components/ui/scope-selector";

export const useSettings = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await liquid.system.getSettings();
      return (response.data as any)?.data?.settings;
    },
    enabled,
  });
};

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await liquid.system.getCountriesInsecure();
      return (response.data as any)?.data?.countries;
    },
  });
};

export const useRoles = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await liquid.roles.list();
      return (response.data as any)?.data?.roles;
    },
    enabled,
  });
};

export const useScopes = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["scopes"],
    queryFn: async () => {
      const response = await liquid.user.getScopes();
      const scopesObject = (response.data as any)?.data?.scopes || {};
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
      const response = await liquid.admin.users.getEditableFields();
      return (response.data as any)?.data?.editableFields;
    },
    enabled,
  });
};

export const useSubscriptionTiers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["subscriptionTiers"],
    queryFn: async () => {
      const response = await liquid.admin.users.getSubscriptionTiers();
      return (response.data as any)?.data?.subscriptionTiers;
    },
    enabled,
  });
};
