import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HardDrive,
  RefreshCw,
  Server,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
} from "lucide-react";
import {
  useSystemStats,
  useSystemHealth,
  useSystemVersion,
  useSystemSettingsList,
} from "@/hooks/api/use-system-telemetry";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SystemTelemetry() {
  const { t } = useTranslation();
  const [refreshInterval, setRefreshInterval] = useState<number | false>(30000);
  const [settingsFilter, setSettingsFilter] = useState("");

  const {
    data: stats,
    isLoading: isStatsLoading,
    isRefetching: isStatsRefetching,
    refetch: refetchStats,
    error: statsError,
  } = useSystemStats(refreshInterval);

  const { data: health, isLoading: isHealthLoading, refetch: refetchHealth } = useSystemHealth();
  const { data: version } = useSystemVersion();
  const { data: settings, isLoading: isSettingsLoading } = useSystemSettingsList();

  const handleManualRefresh = () => {
    refetchStats();
    refetchHealth();
  };

  // Format uptime in seconds to human readable string (e.g. 2d 5h 32m 14s)
  const formatUptime = (seconds?: number): string => {
    if (!seconds && seconds !== 0) return "N/A";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  };

  const heapUsed = stats?.heapUsed ?? 0;
  const heapTotal = stats?.heapTotal ?? 0;
  const heapLimit = stats?.heapLimit ?? heapTotal;
  const rss = stats?.rss ?? 0;
  const systemTotalMemory = stats?.systemTotalMemory ?? 0;
  const memoryPercentage = heapLimit > 0 ? Math.min(100, Math.round((heapUsed / heapLimit) * 100)) : 0;

  const isHealthy = health === "UP";

  const rawRequests = stats?.requestsHandled ?? stats?.requestCount;
  const isRequestCountingEnabled = typeof rawRequests === "number";

  // Filter system settings
  const filteredSettings = Object.entries(settings || {}).filter(([key, val]) => {
    if (!settingsFilter) return true;
    const query = settingsFilter.toLowerCase();
    const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);
    return key.toLowerCase().includes(query) || strVal.toLowerCase().includes(query);
  });

  return (
    <div className="p-4 md:p-8 space-y-6 pb-12 animate-in fade-in-50 duration-300 select-none">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-card border border-border/80 shadow-xs">
        {/* Status Indicator & Mobile Refresh */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {isHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">
                {isHealthy ? t("label.system-operational") : t("label.system-degraded")}
              </h3>
              <Badge variant={isHealthy ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0 font-semibold">
                {health || "CHECKING"}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isStatsRefetching}
            className="sm:hidden gap-1.5 text-xs h-8 px-2.5 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStatsRefetching ? "animate-spin text-primary" : ""}`} />
            <span>{t("button.refresh")}</span>
          </Button>
        </div>

        {/* Controls Container (Auto-Refresh & Desktop Refresh Button) */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Refresh interval selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground hidden md:inline shrink-0">
              {t("label.auto-refresh")}:
            </span>
            <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/60 text-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setRefreshInterval(30000)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-all font-medium text-center ${refreshInterval === 30000
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                30s
              </button>
              <button
                type="button"
                onClick={() => setRefreshInterval(60000)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-all font-medium text-center ${refreshInterval === 60000
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                60s
              </button>
              <button
                type="button"
                onClick={() => setRefreshInterval(300000)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-all font-medium text-center ${refreshInterval === 300000
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                5m
              </button>
              <button
                type="button"
                onClick={() => setRefreshInterval(false)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-all font-medium text-center ${refreshInterval === false
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t("label.paused")}
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isStatsRefetching}
            className="hidden sm:flex gap-2 text-xs h-9 px-3 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStatsRefetching ? "animate-spin text-primary" : ""}`} />
            <span>{t("button.refresh")}</span>
          </Button>
        </div>
      </div>

      {statsError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">
              {t("error.telemetry-failed")}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health & Runtime */}
        <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("label.health-runtime")}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {health || (isHealthLoading ? "..." : "N/A")}
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("label.liquid-version")}:</span>
                <span className="font-semibold text-foreground">v{version || "0.0.0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("label.node-version")}:</span>
                <span className="font-mono text-foreground">{stats?.nodeVersion || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: CPU & OS Platform */}
        <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("label.processor-host")}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Server className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground" title={stats?.cpuMake}>
                {stats?.cpuMake || (isStatsLoading ? "Loading..." : "Unknown CPU")}
                {stats?.cpuCount ? ` (${stats.cpuCount} Cores)` : ""}
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("label.platform")}:</span>
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                  {stats?.platform || "N/A"} {stats?.arch ? `(${stats.arch})` : ""}
                </Badge>
              </div>
              {Boolean(stats?.loadAvg?.length) && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("label.load-avg")}:</span>
                  <span className="font-mono font-medium text-foreground text-[11px]">
                    {stats?.loadAvg?.join(" / ")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("label.process-id")}:</span>
                <span className="font-mono font-medium text-foreground">{stats?.processId ?? "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Memory Heap */}
        <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("label.heap-memory")}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {heapUsed} <span className="text-xs font-normal text-muted-foreground">MB</span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                / {heapLimit ? `${heapLimit} MB` : "N/A"} ({memoryPercentage}%)
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full bg-secondary/80 rounded-full h-2 overflow-hidden border border-border/40">
              <div
                className={`h-full transition-all duration-500 rounded-full ${memoryPercentage > 85
                  ? "bg-destructive"
                  : "bg-primary"
                  }`}
                style={{ width: `${memoryPercentage}%` }}
              />
            </div>

            <div className="pt-2 border-t border-border/40 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("label.committed-pool")}:</span>
                <span className="font-mono font-medium text-foreground">{heapTotal} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("label.process-rss")}:</span>
                <span className="font-mono font-medium text-foreground">{rss ? `${rss} MB` : "N/A"}</span>
              </div>
              {systemTotalMemory > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("label.system-ram")}:</span>
                  <span className="font-mono font-medium text-foreground">{systemTotalMemory} MB</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Throughput & Uptime */}
        <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("label.throughput-uptime")}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {isRequestCountingEnabled ? rawRequests.toLocaleString() : t("label.disabled")}
              </span>
              {isRequestCountingEnabled && (
                <span className="text-xs text-muted-foreground ml-1.5">
                  {t("label.requests")}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-border/40 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("label.uptime")}:</span>
                <Badge variant="outline" className="font-mono text-[11px] font-semibold text-primary border-primary/30 bg-primary/5">
                  {formatUptime(stats?.upTime)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Configurations Section */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                  {t("heading.system-settings")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {t("message.system-settings-description")}
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("label.search-settings")}
                value={settingsFilter}
                onChange={(e) => setSettingsFilter(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isSettingsLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>{t("message.loading-settings")}</span>
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              {settingsFilter ? t("message.no-settings-matching") : t("message.no-settings-found")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredSettings.map(([key, value]) => {
                const isBool = typeof value === "boolean";
                const isNum = typeof value === "number";
                const isObj = typeof value === "object" && value !== null;

                return (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-card/60 hover:bg-accent/40 border border-border/60 transition-colors flex flex-col justify-between gap-2"
                  >
                    <span className="font-mono text-xs font-semibold text-foreground break-all" title={key}>
                      {key}
                    </span>
                    <div className="self-end">
                      {isBool ? (
                        <Badge
                          variant={value ? "default" : "secondary"}
                          className={`text-[10px] ${value ? "bg-primary text-primary-foreground" : ""}`}
                        >
                          {value ? "true" : "false"}
                        </Badge>
                      ) : isNum ? (
                        <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 bg-primary/5">
                          {value}
                        </Badge>
                      ) : isObj ? (
                        <code className="text-[10px] font-mono p-1 rounded bg-muted text-muted-foreground block max-w-full truncate">
                          {JSON.stringify(value)}
                        </code>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded max-w-full truncate inline-block">
                          {String(value)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
