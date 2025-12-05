import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MeContext from "@/context/me-context";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import usePermissions from "@/hooks/use-permissions";
import { User } from "@/types/user";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useVerifyUser, useBanUser, useRestrictUser } from "@/hooks/api/use-user-mutations";

export default function AdminSwitches({
  user,
  setUser,
}: {
  user: User;
  setUser?: any;
}) {
  const [verified, setVerified] = useState(user.verified);
  const [suspended, setSuspended] = useState(user.isBanned);
  const [restricted, setRestricted] = useState(user.isRestricted);

  const { me } = useContext(MeContext);
  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const updateUserInMemory = (setter: any, flag: string, state: boolean) => {
    setter((users: User[]) => {
      if (!users) return users;
      return users.map((iterationUser) =>
        user._id === iterationUser._id
          ? { ...user, [flag]: state }
          : iterationUser
      );
    });
    setUser &&
      setUser((user: User) => {
        return { ...user, [flag]: state };
      });
  };

  const { mutateAsync: verifyUser } = useVerifyUser();
  const { mutateAsync: banUser } = useBanUser();
  const { mutateAsync: restrictUser } = useRestrictUser();

  const onVerifyChange = async (state: boolean) => {
    const promise = verifyUser({
      target: user._id,
      state: state,
    });
    toast.promise(promise, {
      loading: t("message.verifying"),
      success: state ? t("message.verified") : t("message.un-verified"),
      error: t("error.update-failed"),
    });
    await promise;
    updateUserInMemory(setUsers, "verified", state);
    updateUserInMemory(setUsersSearchResults, "verified", state);
    return setVerified(state);
  };

  const onSuspendChange = async (state: boolean) => {
    const promise = banUser({
      target: user._id,
      state,
    });
    toast.promise(promise, {
      loading: t("message.suspending"),
      success: state ? t("message.suspended") : t("message.restored"),
      error: t("error.update-failed"),
    });
    await promise;
    updateUserInMemory(setUsers, "isBanned", state);
    updateUserInMemory(setUsersSearchResults, "isBanned", state);
    return setSuspended(state);
  };

  const onRestrictChange = async (state: boolean) => {
    const promise = restrictUser({
      target: user._id,
      state,
    });
    toast.promise(promise, {
      loading: t("message.restricting"),
      success: state ? t("message.restricted") : t("message.un-restricted"),
      error: t("error.update-failed"),
    });
    await promise;
    updateUserInMemory(setUsers, "isRestricted", state);
    updateUserInMemory(setUsersSearchResults, "isRestricted", state);
    return setRestricted(state);
  };

  return (
    <>
      <div className="space-y-4 my-2">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">{t("label.verified")}</Label>
          </div>
          <Switch
            checked={verified}
            onCheckedChange={onVerifyChange}
            disabled={!isPermissionAllowed("admin:profile:verifications:write")}
          />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-right">{t("label.suspended")}</Label>
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
            <Label className="text-right">{t("label.restricted")}</Label>
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
