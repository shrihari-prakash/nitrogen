import { useQuery } from "@tanstack/react-query";
import { liquid } from "@/service/liquid";

export interface SystemStatsData {
  processId?: number;
  platform?: string;
  nodeVersion?: string;
  cpuMake?: string;
  upTime?: number;
  requestsHandled?: number;
  heapTotal?: number;
  heapUsed?: number;
  [key: string]: any;
}

export const useSystemStats = (refetchInterval: number | false = 30000) => {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const response = await liquid.admin.system.getStats();
      return ((response.data as any)?.stats || {}) as SystemStatsData;
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
      return (response.data as any)?.status || "UNKNOWN";
    },
    refetchInterval: 15000,
  });
};

export const useSystemVersion = () => {
  return useQuery({
    queryKey: ["system-version"],
    queryFn: async () => {
      const response = await liquid.system.getVersion();
      return (response.data as any)?.version || "0.0.0";
    },
  });
};

export const useSystemSettingsList = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["system-settings-list"],
    queryFn: async () => {
      const response = await liquid.system.getSettings();
      return ((response.data as any)?.settings || {}) as Record<string, any>;
    },
    enabled,
  });
};
