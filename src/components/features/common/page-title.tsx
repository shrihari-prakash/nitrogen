import { TypographyH4 } from "@/components/ui/typography";
import MeContext from "@/context/me-context";
import { User } from "@/types/user";
import { ReactNode, useContext } from "react";
import { useTranslation } from "react-i18next";

export const PageTitle = ({
  title,
  icon,
}: {
  title: ReactNode;
  icon: ReactNode;
}) => {
  const { me } = useContext(MeContext);
  const { t } = useTranslation();

  return (
    <div
      className="flex justify-between flex-row px-4 md:px-8 pt-4"
      data-t="page-title"
    >
      <TypographyH4 className="capitalize flex gap-2 items-center">
        {icon}
        {title}
      </TypographyH4>
      <TypographyH4 className="capitalize">
        <span data-t="greeting">{t("message.hello", { name: (me as User).firstName })}</span>
      </TypographyH4>
    </div>
  );
};
