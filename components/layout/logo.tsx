import { cn } from "@/lib/utils/cn";
import { HeartHandshake } from "lucide-react";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
        <HeartHandshake className="h-5 w-5" />
      </span>
      {showText && (
        <span className="text-base tracking-tight">
          AidBridge<span className="text-brand-500"> AI</span>
        </span>
      )}
    </span>
  );
}
