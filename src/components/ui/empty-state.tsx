import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing to show",
  description,
  icon = <FolderOpen className="w-5 h-5 text-muted-foreground" />,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in-50 duration-200 select-none",
        className
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border border-border mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
