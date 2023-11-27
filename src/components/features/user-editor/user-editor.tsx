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

const UserEditor = function ({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any | User>();
  const [loadError, setLoadError] = useState(false);

  const isPermissionAllowed = usePermissions();

  const { scopes, refreshScopes } = useContext(ScopesContext);

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
            <SheetTitle>Edit user</SheetTitle>
          </SheetHeader>
          {!user ? (
            loadError ? (
              <div className="flex items-center justify-center h-full w-full">
                <XCircle size={22} className="mr-2" />
                Error loading user
              </div>
            ) : (
              <Loader className="!h-[calc(100%-28px)]"/>
            )
          ) : (
            <>
              <ProfileCard user={user} />
              {scopes && (
                <>
                  <TypographyH4 className="my-4">Permissions</TypographyH4>
                  <ScopeSelector
                    user={user}
                    setUser={setUser}
                    scopes={scopes}
                    type="user"
                    onSelect={(selected: string) => console.log(selected)}
                  />
                </>
              )}
              <TypographyH4 className="my-4">Basic Info</TypographyH4>
              <BasicInfoEditor user={user} setUser={setUser} />
              <TypographyH4 className="my-4">Admin Controls</TypographyH4>
              <AdminSwitches user={user} setUser={setUser} />
              {isPermissionAllowed("admin:profile:subscriptions:write") && (
                <>
                  <TypographyH4 className="my-4">Subscription</TypographyH4>
                  <SubscriptionManager user={user} setUser={setUser} />
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
