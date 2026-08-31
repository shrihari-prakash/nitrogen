import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: number;
  label?: string;
  minHeight?: string;
}

export default function Loader({
  className = "",
  size = 28,
  label,
  minHeight = "min-h-[200px]",
}: LoaderProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center gap-3 cursor-default select-none py-8 animate-in fade-in-50 duration-300",
        minHeight,
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
        <Loader2 size={size} className="animate-spin text-primary relative z-10" />
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}

