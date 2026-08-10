import { useContext, useState } from "react";
import MeContext from "@/context/me-context";
import { User } from "@/types/user";
import { useTranslation } from "react-i18next";
import { useLogout } from "@/hooks/api/use-auth";
import oauthManager from "@/service/oauth-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IoLogOut, IoChevronDown, IoSunny, IoMoon } from "react-icons/io5";

export const UserNav = () => {
  const { me } = useContext(MeContext);
  const { t } = useTranslation();
  const { mutateAsync: logout } = useLogout();
  const { theme, setTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const user = me as User | undefined;
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user?.username || "User";

  const onConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      oauthManager.clearCredentials();
      window.location.reload();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-t="user-nav-trigger"
          >
            <Avatar className="h-8 w-8 border border-border shadow-sm">
              {user?.profilePictureUrl && (
                <AvatarImage src={user.profilePictureUrl} alt={fullName} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span className="text-sm font-medium hidden md:block" data-t="greeting">
              {t("message.hello", { name: firstName || fullName })}
            </span>

            <IoChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 mt-1">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              {user?.email && (
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="cursor-pointer gap-2 font-medium"
          >
            {isDark ? (
              <IoSunny className="h-4 w-4" />
            ) : (
              <IoMoon className="h-4 w-4" />
            )}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            id="logout"
            data-t="logout"
            onClick={() => setShowLogoutConfirm(true)}
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 font-medium"
          >
            <IoLogOut className="h-4 w-4 text-destructive" />
            <span>{t("heading.logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("heading.logout")}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              {t("button.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? t("button.updating") : t("heading.logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
