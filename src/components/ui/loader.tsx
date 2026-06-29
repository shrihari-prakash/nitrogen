import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: number;
  label?: string;
}

export default function Loader({
  className = "",
  size = 24,
  label,
}: LoaderProps) {
  return (
    <div
      className={cn(
        "flex-1 w-full h-full flex flex-col items-center justify-center gap-2 cursor-default select-none py-4 animate-in fade-in-50 duration-200",
        className
      )}
    >
      <Loader2 size={size} className="animate-spin text-primary" />
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
