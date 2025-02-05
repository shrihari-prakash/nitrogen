import usePermissions from "@/hooks/use-permissions";
import axiosInstance from "@/service/axios";
import oauthManager from "@/service/oauth-manager";
import { useTranslation } from "react-i18next";
import { IoLogOut } from "react-icons/io5";
import { BsFillBoxFill, BsFillShieldLockFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { Link } from "wouter";

export default function SideBar() {
  const { isPermissionAllowed } = usePermissions();
  const { t } = useTranslation();

  const onLogout = async () => {
    try {
      await axiosInstance.get("/user/logout", { withCredentials: true });
    } finally {
      oauthManager.clearCredentials();
      window.location.reload();
    }
  };

  return (
    <div
      className="h-16
        md:h-full
        w-full
        md:w-16
        m-0
        flex
        flex-row
        md:flex-col
        bg-background
        text-text-on-surface 
        border-t-[1px]
        md:border-r-[1px]
        md:border-t-0
        border-border
        border-opacity-40"
    >
      <SideBarIcon
        icon={<FaUsers size="20" />}
        text={t("heading.users")}
        route="/users"
        id="users"
      />
      {isPermissionAllowed("delegated:roles:read") && (
        <SideBarIcon
          icon={<BsFillShieldLockFill size="18" />}
          text={t("heading.roles-and-permissions")}
          route="/roles"
          id="roles"
        />
      )}
      <SideBarIcon
        icon={<BsFillBoxFill size="18" />}
        text={t("heading.applications")}
        route="/applications"
        id="applications"
      />
      <SideBarIcon
        icon={<IoLogOut size="20" />}
        text={t("heading.logout")}
        route="#"
        onActivate={onLogout}
        id="logout"
      />
    </div>
  );
}

export const SideBarIcon = ({
  icon,
  text,
  route,
  onActivate,
  id,
}: {
  icon: any;
  text: string;
  route: string;
  onActivate?: any;
  id: string;
}) => {
  return (
    <Link href={route} onClick={onActivate}>
      <div
        data-t={`navigation-${id}`}
        className="relative
          flex
          items-center
          justify-center
          cursor-pointer
          h-10
          w-10
          mt-2
          mb-2
          mx-auto
          rounded-3xl
          hover:rounded-xl
          transition-all
          duration-150
          ease-linear
          group
          outline-offset-2
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-ring/70
          bg-secondary
          text-secondary-foreground
          hover:bg-primary/75
          border
          border-primary-foreground/5
          hover:border-primary-foreground/10
          hover:text-primary-foreground
          shadow-sm
          shadow-black/5"
      >
        {icon}
        <span
          className="absolute
            w-auto
            p-2
            m-2
            min-w-max
            bottom-14
            left-auto
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
            origin-left
            z-50
            group-hover:scale-100"
        >
          {text}
        </span>
      </div>
    </Link>
  );
};
