import { useContext, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { XCircle, Shield, KeyRound, User as UserIcon, Sliders, CreditCard, Coins, Database } from "lucide-react";
import { useLocation } from "wouter";
import Loader from "@/components/ui/loader";
import AdminSwitches from "./admin-switches";
import BasicInfoEditor from "./basic-info-editor";
import ProfileCard from "./profile-card";
import ScopeSelector from "@/components/ui/scope-selector";
import ScopesContext from "@/context/scopes-context";
import usePermissions from "@/hooks/use-permissions";
import SubscriptionManager from "./subscription-manager";
import CustomDataEditor from "./custom-data-editor";
import CreditsEditor from "./credits-editor";
import { LoginHistoryDialog } from "./login-history-dialog";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/api/use-users";

const EditorSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 md:p-4 my-3 shadow-xs space-y-2.5 transition-colors">
    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
      {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
      <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
    </div>
    <div>{children}</div>
  </div>
);

const UserEditor = function ({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { data: user, isError: loadError } = useUser(params.id);
  const setUser = () => { };

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

  const onOpenChange = (state: boolean) => {
    if (!state) {
      setLocation("/users");
    }
  };

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
                  <EditorSection title={t("heading.security")} icon={Shield}>
                    <LoginHistoryDialog user={user} />
                  </EditorSection>
                )}

              {scopes &&
                isPermissionAllowed("admin:profile:access:write") &&
                !isUserSuperAdmin() && (
                  <EditorSection title={t("heading.permissions")} icon={KeyRound}>
                    <ScopeSelector
                      entity={user}
                      setEntity={setUser}
                      scopes={scopes}
                      type="user"
                      onSelect={(selected: string) => console.log(selected)}
                      role={user.role}
                      warning
                    />
                  </EditorSection>
                )}

              <EditorSection title={t("heading.basic-info")} icon={UserIcon}>
                <BasicInfoEditor user={user} setUser={setUser} />
              </EditorSection>

              <EditorSection title={t("heading.administration")} icon={Sliders}>
                <AdminSwitches user={user} setUser={setUser} />
              </EditorSection>

              {isPermissionAllowed("admin:profile:subscriptions:write") && (
                <EditorSection title={t("heading.subscription")} icon={CreditCard}>
                  <SubscriptionManager user={user} setUser={setUser} />
                </EditorSection>
              )}

              {isPermissionAllowed("admin:profile:credits:write") && (
                <EditorSection title={t("heading.credits")} icon={Coins}>
                  <CreditsEditor user={user} setUser={setUser} />
                </EditorSection>
              )}

              {isPermissionAllowed("admin:profile:custom-data:write") && (
                <EditorSection title={t("heading.custom-data")} icon={Database}>
                  <CustomDataEditor user={user} />
                </EditorSection>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UserEditor;
