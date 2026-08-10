import usePermissions from "@/hooks/use-permissions";
import { useTranslation } from "react-i18next";
import { BsFillBoxFill, BsFillShieldLockFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { Activity } from "lucide-react";
import { IoSunny, IoMoon } from "react-icons/io5";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";

export default function SideBar() {
  const { isPermissionAllowed } = usePermissions();
  const { t } = useTranslation();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className="h-16
        shrink-0
        md:h-full
        w-full
        md:w-16
        m-0
        flex
        flex-row
        md:flex-col
        items-center
        justify-around
        md:justify-start
        bg-background
        text-text-on-surface 
        border-t-[1px]
        md:border-r-[1px]
        md:border-t-0
        border-border
        border-opacity-40
        px-2
        py-1
        md:py-3
        z-40"
    >
      <div className="flex flex-row md:flex-col items-center gap-1 md:gap-3 w-full justify-around md:justify-start">
        <SideBarIcon
          icon={<FaUsers size="20" />}
          text={t("heading.users")}
          route="/users"
          id="users"
          currentLocation={location}
        />
        {isPermissionAllowed("delegated:roles:read") && (
          <SideBarIcon
            icon={<BsFillShieldLockFill size="18" />}
            text={t("heading.roles-and-permissions")}
            route="/roles"
            id="roles"
            currentLocation={location}
          />
        )}
        <SideBarIcon
          icon={<BsFillBoxFill size="18" />}
          text={t("heading.applications")}
          route="/applications"
          id="applications"
          currentLocation={location}
        />
        {isPermissionAllowed("delegated:system:settings:read") && (
          <SideBarIcon
            icon={<Activity size="20" />}
            text={t("heading.system-telemetry")}
            route="/system"
            id="system"
            currentLocation={location}
          />
        )}
      </div>

      {/* Theme Toggle Button at Sidebar Bottom (Desktop Only) */}
      <div className="hidden md:flex md:mt-auto md:mb-1">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="relative flex items-center justify-center h-10 w-10 rounded-2xl hover:rounded-xl bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 group border border-border/40 shadow-sm"
        >
          {isDark ? <IoSunny size="19" /> : <IoMoon size="18" />}
          <span
            className="absolute
              w-auto
              p-2
              m-2
              min-w-max
              bottom-14
              left-1/2
              -translate-x-1/2
              md:translate-x-0
              md:left-14
              md:bottom-auto
              rounded-md
              shadow-md
              text-foreground
              bg-muted
              text-sm
              font-medium
              transition-all
              duration-100
              scale-0
              origin-bottom
              md:origin-left
              z-50
              group-hover:scale-100
              pointer-events-none"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>
    </div>
  );
}

export const SideBarIcon = ({
  icon,
  text,
  route,
  onActivate,
  id,
  currentLocation,
}: {
  icon: any;
  text: string;
  route: string;
  onActivate?: any;
  id: string;
  currentLocation?: string;
}) => {
  const isActive =
    currentLocation === route ||
    (route === "/users" && (currentLocation === "/" || currentLocation?.startsWith("/users"))) ||
    (route !== "/users" && currentLocation?.startsWith(route));

  return (
    <Link href={route} onClick={onActivate}>
      <div
        data-t={`navigation-${id}`}
        className={`relative
          flex
          items-center
          justify-center
          cursor-pointer
          h-10
          w-10
          my-1
          mx-auto
          transition-all
          duration-200
          ease-out
          group
          outline-offset-2
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-ring/70
          ${isActive
            ? "bg-primary border border-primary-foreground/20 text-primary-foreground shadow-md shadow-primary/25 rounded-xl scale-105"
            : "bg-secondary/80 border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/80 rounded-xl"
          }`}
      >
        {isActive && (
          <>
            <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-sm" />
            <div className="md:hidden absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-primary rounded-b-full shadow-sm" />
          </>
        )}
        {icon}
        <span
          className="absolute
            w-auto
            p-2
            m-2
            min-w-max
            bottom-14
            left-1/2
            -translate-x-1/2
            md:translate-x-0
            md:left-14
            md:bottom-auto
            rounded-md
            shadow-md
            text-foreground
            bg-muted
            text-sm
            font-medium
            transition-all
            duration-100
            scale-0
            origin-bottom
            md:origin-left
            z-50
            group-hover:scale-100
            pointer-events-none"
        >
          {text}
        </span>
      </div>
    </Link>
  );
};
