import * as React from "react";
import { User } from "@/types/user";
import {
  CheckCircle2,
  AlertOctagon,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  KeyRound,
  Copy,
  Check,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Clock,
  Code2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import UAParser from "ua-parser-js";
import { useLoginHistory } from "@/hooks/api/use-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface LoginHistoryProps {
  user: User;
}

interface LoginRecord {
  _id?: string;
  userAgent?: string;
  ipAddress?: string;
  success: boolean;
  reason?: string;
  source: "password" | "google" | string;
  targetId: string;
  createdAt: string;
}

const CopyIpButton = ({ ip }: { ip: string }) => {
  const [copied, setCopied] = React.useState(false);
  const { t } = useTranslation();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast(t("message.copied-ip") || "IP address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(t("message.copy-failed") || "Copy failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy IP Address"
      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
};

// Formats user agent cleanly
const parseUA = (uaString?: string) => {
  if (!uaString) {
    return {
      browserText: "Unknown Browser",
      osText: "Unknown OS",
      deviceText: "Desktop",
      deviceType: "desktop",
      raw: "",
    };
  }

  const parser = new UAParser(uaString);
  const result = parser.getResult();

  // Browser
  const browserName = result.browser.name || "";
  const browserVersion = result.browser.major || result.browser.version || "";
  const browserText = browserName
    ? `${browserName} ${browserVersion}`.trim()
    : "Web Browser";

  // OS
  const osName = result.os.name || "";
  const osVersion = result.os.version || "";
  const osText = osName ? `${osName} ${osVersion}`.trim() : "Unknown OS";

  // Device
  let deviceType = result.device.type || "desktop";
  if (
    result.os.name === "iOS" ||
    result.os.name === "Android" ||
    result.device.type === "mobile"
  ) {
    deviceType = "mobile";
  } else if (result.device.type === "tablet") {
    deviceType = "tablet";
  }

  const vendor = result.device.vendor || "";
  const model = result.device.model || "";
  let deviceText = "Desktop";
  if (vendor || model) {
    deviceText = `${vendor} ${model}`.trim();
  } else if (deviceType === "mobile") {
    deviceText = "Mobile Device";
  } else if (deviceType === "tablet") {
    deviceText = "Tablet Device";
  }

  return {
    browserText,
    osText,
    deviceText,
    deviceType,
    raw: uaString,
  };
};

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="h-4 w-4 text-primary shrink-0" />;
    case "tablet":
      return <Tablet className="h-4 w-4 text-primary shrink-0" />;
    default:
      return <Laptop className="h-4 w-4 text-primary shrink-0" />;
  }
};

const LoginHistoryCard = ({ entry }: { entry: LoginRecord }) => {
  const [expanded, setExpanded] = React.useState(false);
  const { t } = useTranslation();
  const ua = React.useMemo(() => parseUA(entry.userAgent), [entry.userAgent]);

  const recordDate = React.useMemo(() => {
    try {
      return new Date(entry.createdAt);
    } catch {
      return new Date();
    }
  }, [entry.createdAt]);

  const formattedDate = React.useMemo(() => {
    try {
      return format(recordDate, "MMM d, yyyy • h:mm:ss a");
    } catch {
      return entry.createdAt;
    }
  }, [recordDate, entry.createdAt]);

  const relativeTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(recordDate, { addSuffix: true });
    } catch {
      return "";
    }
  }, [recordDate]);

  const isSuccess = entry.success;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isSuccess
          ? "bg-card/70 border-border/70 hover:border-emerald-500/30 hover:shadow-xs"
          : "bg-destructive/5 border-destructive/25 hover:border-destructive/40 hover:shadow-xs"
      }`}
    >
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Top Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-7 w-7 rounded-lg ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertOctagon className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-foreground">
                  {isSuccess
                    ? t("message.successful-login")
                    : t("message.failed-login-attempt")}
                </span>
                <Badge
                  variant={isSuccess ? "outline" : "destructive"}
                  className={`text-[10px] px-1.5 py-0 font-medium ${
                    isSuccess
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : ""
                  }`}
                >
                  {isSuccess ? "200 OK" : "Failed"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Timestamp Badges */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto sm:ml-0">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            <span className="font-mono text-[11px]" title={entry.createdAt}>
              {formattedDate}
            </span>
            {relativeTime && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0 text-muted-foreground hidden md:inline-flex"
              >
                {relativeTime}
              </Badge>
            )}
          </div>
        </div>

        {/* Failed reason callout if present */}
        {!isSuccess && entry.reason && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {t("label.failure-reason")}: <span className="font-mono">{entry.reason}</span>
            </span>
          </div>
        )}

        {/* Metadata Chips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
          {/* Device & OS */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50">
            {getDeviceIcon(ua.deviceType)}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate text-xs">
                {ua.browserText}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {ua.osText} {ua.deviceText !== "Desktop" && `• ${ua.deviceText}`}
              </p>
            </div>
          </div>

          {/* IP Address */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {t("label.ip-address")}
                </p>
                <p className="font-mono text-xs font-medium text-foreground truncate">
                  {entry.ipAddress || "Unknown IP"}
                </p>
              </div>
            </div>
            {entry.ipAddress && <CopyIpButton ip={entry.ipAddress} />}
          </div>

          {/* Auth Method */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50">
            <KeyRound className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {t("label.auth-source")}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {entry.source === "google" ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium"
                  >
                    Google SSO
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border/70 capitalize font-medium"
                  >
                    {entry.source || "Password"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details Accordion */}
        {entry.userAgent && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            >
              <Code2 className="h-3 w-3" />
              <span>{expanded ? "Hide technical details" : "Show technical details"}</span>
              {expanded ? (
                <ChevronUp className="h-3 w-3 ml-0.5" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-0.5" />
              )}
            </button>

            {expanded && (
              <div className="mt-2 p-2.5 rounded-lg bg-background/80 border border-border/60 text-[11px] font-mono text-muted-foreground space-y-1.5 animate-in fade-in-50 duration-150">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground text-[10px] uppercase">
                    User-Agent:
                  </span>
                  <span className="break-all selection:bg-primary/20">{entry.userAgent}</span>
                </div>
                {entry.ipAddress && (
                  <div className="flex gap-2 pt-1 border-t border-border/40 text-[10px]">
                    <span>Target ID: <code className="text-foreground">{entry.targetId}</code></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LoginHistorySkeleton = () => {
  return (
    <div className="space-y-3 animate-in fade-in-50 duration-200">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function LoginHistory({ user }: LoginHistoryProps) {
  const { data: rawHistory = [], isLoading, isRefetching, refetch } = useLoginHistory(user._id);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "success" | "failed">("all");

  const loginHistory = (rawHistory as LoginRecord[]) || [];

  // Metrics
  const totalCount = loginHistory.length;
  const successCount = loginHistory.filter((item) => item.success).length;
  const failedCount = loginHistory.filter((item) => !item.success).length;

  // Filtered History
  const filteredHistory = React.useMemo(() => {
    return loginHistory.filter((entry) => {
      // Type Filter
      if (filterType === "success" && !entry.success) return false;
      if (filterType === "failed" && entry.success) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ipMatch = entry.ipAddress?.toLowerCase().includes(q);
        const sourceMatch = entry.source?.toLowerCase().includes(q);
        const reasonMatch = entry.reason?.toLowerCase().includes(q);
        const uaMatch = entry.userAgent?.toLowerCase().includes(q);
        const statusMatch = entry.success
          ? "success".includes(q)
          : "failed".includes(q);

        if (!ipMatch && !sourceMatch && !reasonMatch && !uaMatch && !statusMatch) {
          return false;
        }
      }

      return true;
    });
  }, [loginHistory, filterType, searchQuery]);

  return (
    <div className="space-y-3.5">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t("placeholder.search-login-history")}
            className="pl-8 text-xs h-9 bg-card border-border/70 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Segment & Refresh Button */}
        <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
          <div className="flex items-center bg-muted/60 border border-border/80 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                filterType === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("filter.all")} ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("success")}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5 ${
                filterType === "success"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t("filter.success")} ({successCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("failed")}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5 ${
                filterType === "failed"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
              <span>{t("filter.failed")} ({failedCount})</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="h-9 w-9 shrink-0 rounded-lg"
            title="Refresh Audit Trail"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefetching ? "animate-spin text-primary" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {isLoading ? (
          <LoginHistorySkeleton />
        ) : filteredHistory.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={
                searchQuery || filterType !== "all"
                  ? t("message.no-matching-logins")
                  : t("message.no-login-history")
              }
              description={
                searchQuery || filterType !== "all"
                  ? t("message.no-matching-logins-desc")
                  : t("message.no-login-history-desc")
              }
              icon={<ShieldAlert className="w-6 h-6 text-muted-foreground" />}
            >
              {(searchQuery || filterType !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                  className="mt-2 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  {t("button.reset")}
                </Button>
              )}
            </EmptyState>
          </div>
        ) : (
          filteredHistory.map((entry, index) => (
            <LoginHistoryCard
              key={entry._id || `${entry.createdAt}-${index}`}
              entry={entry}
            />
          ))
        )}
      </div>
    </div>
  );
}
