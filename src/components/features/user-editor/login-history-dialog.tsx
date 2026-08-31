import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginHistory from "./login-history";
import { User } from "@/types/user";
import { useTranslation } from "react-i18next";
import { History, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LoginHistoryDialog({ user }: { user: User }) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="whitespace-nowrap">
          <History className="h-4 w-4 mr-2" />
          {t("message.audit-logins")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 rounded-2xl border-border/80 shadow-2xl">
        <DialogHeader className="border-b border-border/50 pb-4 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  {t("heading.audit-logins")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Track and review all authentication activity and security events
                </DialogDescription>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 font-medium">
                @{user.username || user.name || "user"}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <div className="py-2">
          <LoginHistory user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
