import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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

const UserDetails = function ({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any | User>();
  const [loadError, setLoadError] = useState(false);
  /* const [submitting, setSubmitting] = useState(false); */

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

  return (
    <>
      <Sheet defaultOpen={true} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit user</SheetTitle>
            <SheetDescription>
              Make changes to the profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          {!user ? (
            loadError ? (
              <div className="flex items-center justify-center h-full w-full">
                <XCircle size={22} className="mr-2" />
                Error loading user
              </div>
            ) : (
              <Loader />
            )
          ) : (
            <>
              <ProfileCard user={user}/>
              <BasicInfoEditor user={user} />
              <AdminSwitches user={user} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UserDetails;
