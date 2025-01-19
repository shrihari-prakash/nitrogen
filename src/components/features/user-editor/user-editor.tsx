import { useContext, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { XCircle } from "lucide-react";
import { useLocation } from "wouter";
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";
import Loader from "@/components/ui/loader";
import AdminSwitches from "./admin-switches";
import BasicInfoEditor from "./basic-info-editor";
import ProfileCard from "./profile-card";
import ScopeSelector from "@/components/ui/scope-selector";
import ScopesContext from "@/context/scopes-context";
import usePermissions from "@/hooks/use-permissions";
import { TypographyH4 } from "@/components/ui/typography";
import SubscriptionManager from "./subscription-manager";
import CustomDataEditor from "./custom-data-editor";
import { LoginHistoryDialog } from "./login-history-dialog";
import { useTranslation } from "react-i18next";

const UserEditor = function ({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any | User>();
  const [loadError, setLoadError] = useState(false);

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const { scopes, refreshScopes } = useContext(ScopesContext);

  const isUserSuperAdmin = () => {
    if (!user) {
      return false;
    }
    return user.role === "super_admin";
  };

  useEffect(() => {
    if (!scopes) refreshScopes();
  }, [scopes, refreshScopes]);

  const userRef = useRef({});

  const onOpenChange = (state: boolean) => {
    if (!state) {
      setLocation("/users");
    }
  };

  useEffect(() => {
    setLoadError(false);
    userRef.current = {};
    axiosInstance
      .get("/user/admin-api/user-info?targets=" + params.id)
      .then((response) => {
        setUser(response.data.data.users[0]);
      })
      .catch(() => {
        setLoadError(true);
      });
  }, [params.id, setUser]);

  if (!isPermissionAllowed("admin:profile:read")) {
    return null;
  }

  return (
    <>
      <Sheet defaultOpen={true} onOpenChange={onOpenChange}>
        <SheetContent className="w-full md:!max-w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("heading.edit-user")}</SheetTitle>
          </SheetHeader>
          {!user ? (
            loadError ? (
              <div className="flex items-center justify-center h-full w-full">
                <XCircle size={22} className="mr-2" />
                {t("error.load-failed")}
              </div>
            ) : (
              <Loader className="!h-[calc(100%-28px)]" />
            )
        ) : (
            <>
              <ProfileCard user={user} />
              {scopes &&
                isPermissionAllowed("admin:profile:login-history:read") && (
                  <>
                    <TypographyH4 className="my-4">
                      {t("heading.security")}
                    </TypographyH4>
                    <LoginHistoryDialog user={user} />
                  </>
                )}
              {scopes &&
                isPermissionAllowed("admin:profile:access:write") &&
                !isUserSuperAdmin() && (
                  <>
                    <TypographyH4 className="my-4">
                      {t("heading.permissions")}
                    </TypographyH4>
                    <ScopeSelector
                      entity={user}
                      setEntity={setUser}
                      scopes={scopes}
                      type="user"
                      onSelect={(selected: string) => console.log(selected)}
                      role={user.role}
                      warning
                    />
                  </>
                )}
              <TypographyH4 className="my-4">
                {t("heading.basic-info")}
              </TypographyH4>
              <BasicInfoEditor user={user} setUser={setUser} />
              <TypographyH4 className="my-4">
                {t("heading.administration")}
              </TypographyH4>
              <AdminSwitches user={user} setUser={setUser} />
              {isPermissionAllowed("admin:profile:subscriptions:write") && (
                <>
                  <TypographyH4 className="my-4">
                    {t("heading.subscription")}
                  </TypographyH4>
                  <SubscriptionManager user={user} setUser={setUser} />
                </>
              )}
              {isPermissionAllowed("admin:profile:custom-data:write") && (
                <>
                  <TypographyH4 className="my-4">
                    {t("heading.custom-data")}
                  </TypographyH4>
                  <CustomDataEditor user={user}></CustomDataEditor>
                </>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UserEditor;
