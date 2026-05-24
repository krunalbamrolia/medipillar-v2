import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTableShellProps {
  isFetching?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AdminTableShell({
  isFetching = false,
  children,
  footer,
  className,
}: AdminTableShellProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card shadow-sm",
        className,
      )}
    >
      {isFetching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}
