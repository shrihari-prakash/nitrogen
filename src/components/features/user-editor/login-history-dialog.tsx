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

export function LoginHistoryDialog({ user }: { user: User }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Audit Logins</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Audit Logins</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <LoginHistory user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
