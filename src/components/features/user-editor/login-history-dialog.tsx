import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginHistory from "./login-history";
import { User } from "@/types/user";
import { useTranslation } from "react-i18next";

export function LoginHistoryDialog({ user }: { user: User }) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("message.audit-logins")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80%] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("message.audit-logins")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <LoginHistory user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
