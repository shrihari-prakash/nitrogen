import { TypographyH4 } from "@/components/ui/typography";
import { UserNav } from "@/components/features/common/user-nav";
import { ReactNode } from "react";

export const PageTitle = ({
  title,
  icon,
}: {
  title: ReactNode;
  icon: ReactNode;
}) => {
  return (
    <div
      className="flex justify-between items-center flex-row px-4 md:px-8 pt-4"
      data-t="page-title"
    >
      <TypographyH4 className="capitalize flex gap-2 items-center">
        {icon}
        {title}
      </TypographyH4>
      <div className="flex items-center gap-2">
        <UserNav />
      </div>
    </div>
  );
};
