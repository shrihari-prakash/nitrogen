import { Loader2 } from "lucide-react";

export default function Loader({ className = "" }) {
  return (
    <div
      className={[
        "flex-1 w-full h-full flex items-center justify-center cursor-default select-none ",
        className,
      ].join(" ")}
    >
      <div className="animate-spin">
        <Loader2 size={24} />
      </div>
    </div>
  );
}
