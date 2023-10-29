import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TypographyH4 } from "@/components/ui/typography";
import { User } from "@/types/user";

export default function AdminSwitches({ user }: { user: User }) {
  console.log(user);
  return (
    <>
      <TypographyH4>Admin Controls</TypographyH4>
      <div className="space-y-4 mt-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Verified</Label>
          </div>
          <Switch checked={true} />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Suspended</Label>
          </div>
          <Switch checked={true} />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Restricted</Label>
          </div>
          <Switch checked={true} />
        </div>
      </div>
    </>
  );
}
