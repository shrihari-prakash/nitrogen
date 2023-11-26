import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MeContext from "@/context/me-context";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import usePermissions from "@/hooks/use-permissions";
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";
import { useContext, useState } from "react";
import { toast } from "react-toastify";

export default function AdminSwitches({ user }: { user: User }) {
  const [verified, setVerified] = useState(user.verified);
  const [suspended, setSuspended] = useState(user.isBanned);
  const [restricted, setRestricted] = useState(user.isRestricted);

  const { me } = useContext(MeContext);
  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const isPermissionAllowed = usePermissions();

  const setUserFlag = (setter: any, flag: string, state: boolean) => {
    setter((users: User[]) => {
      if (!users) return users;
      return users.map((iterationUser) =>
        user._id === iterationUser._id
          ? { ...user, [flag]: state }
          : iterationUser
      );
    });
  };

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
    setUserFlag(setUsers, "verified", state);
    setUserFlag(setUsersSearchResults, "verified", state);
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
    setUserFlag(setUsers, "isBanned", state);
    setUserFlag(setUsersSearchResults, "isBanned", state);
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
    setUserFlag(setUsers, "isRestricted", state);
    setUserFlag(setUsersSearchResults, "isRestricted", state);
    return setRestricted(state);
  };

  return (
    <>
      <div className="space-y-4 my-2">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Verified</Label>
          </div>
          <Switch
            checked={verified}
            onCheckedChange={onVerifyChange}
            disabled={!isPermissionAllowed("admin:profile:verifications:write")}
          />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Suspended</Label>
          </div>
          <Switch
            checked={suspended}
            disabled={
              ((me as User)._id as string) === user._id ||
              !isPermissionAllowed("admin:profile:ban:write")
            }
            onCheckedChange={onSuspendChange}
          />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">Restricted</Label>
          </div>
          <Switch
            checked={restricted}
            onCheckedChange={onRestrictChange}
            disabled={!isPermissionAllowed("admin:profile:restrict:write")}
          />
        </div>
      </div>
    </>
  );
}