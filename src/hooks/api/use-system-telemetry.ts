import { useQuery } from "@tanstack/react-query";
import { liquid } from "@/service/liquid";

export const useSystemStats = (refetchInterval: number | false = 30000) => {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const response = await liquid.admin.system.getStats();
      return response.data.stats;
    },
    refetchInterval,
    staleTime: 2000,
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const response = await liquid.health.check();
      return response.data.status || "UNKNOWN";
    },
    refetchInterval: 15000,
  });
};

export const useSystemVersion = () => {
  return useQuery({
    queryKey: ["system-version"],
    queryFn: async () => {
      const response = await liquid.system.getVersion();
      return response.data.version || "0.0.0";
    },
  });
};

export const useSystemSettingsList = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["system-settings-list"],
    queryFn: async () => {
      const response = await liquid.system.getSettings();
      return response.data.settings as Record<string, any>;
    },
    enabled,
  });
};
