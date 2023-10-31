import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TypographyH4 } from "@/components/ui/typography";
import MeContext from "@/context/me-context";
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";
import { useContext, useState } from "react";
import { toast } from "react-toastify";

export default function AdminSwitches({ user }: { user: User }) {
  const [verified, setVerified] = useState(user.verified);
  const [suspended, setSuspended] = useState(user.isBanned);
  const [restricted, setRestricted] = useState(user.isRestricted);

  const { me } = useContext(MeContext);

  const onVerifyChange = async (state: boolean) => {
    const promise = axiosInstance.post("/user/admin-api/verify", {
      target: user._id,
      state: state,
    });
    toast.promise(promise, {
      pending: "Submitting...",
      success: "Update successfull",
      error: "Update failed!",
    });
    await promise;
    return setVerified(state);
  };

  const onSuspendChange = async (state: boolean) => {
    const promise = axiosInstance.post("/user/admin-api/ban", {
      target: user._id,
      state,
    });
    toast.promise(promise, {
      pending: "Submitting...",
      success: "Update successfull",
      error: "Update failed!",
    });
    await promise;
    return setSuspended(state);
  };

  const onRestrictChange = async (state: boolean) => {
    const promise = axiosInstance.post("/user/admin-api/restrict", {
      target: user._id,
      state,
    });
    toast.promise(promise, {
      pending: "Submitting...",
      success: "Update successfull",
      error: "Update failed!",
    });
    await promise;
    return setRestricted(state);
  };

  return (
    <>
      <TypographyH4>Admin Controls</TypographyH4>
      <div className="space-y-4 mt-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Verified</Label>
          </div>
          <Switch checked={verified} onCheckedChange={onVerifyChange} />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Suspended</Label>
          </div>
          <Switch
            checked={suspended}
            disabled={(me as User)._id as string === user._id}
            onCheckedChange={onSuspendChange}
          />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Restricted</Label>
          </div>
          <Switch checked={restricted} onCheckedChange={onRestrictChange} />
        </div>
      </div>
    </>
  );
}
