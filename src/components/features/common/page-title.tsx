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
      className="flex justify-between items-center flex-row px-4 md:px-8 py-3.5 border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-30"
      data-t="page-title"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-2 rounded-xl bg-primary/10 text-primary border border-primary/15 shadow-xs">
          {icon}
        </div>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground capitalize">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <UserNav />
      </div>
    </div>
  );
};
