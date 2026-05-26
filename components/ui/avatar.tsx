import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, fallback, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-semibold text-white",
        className
      )}
      {...props}
    >
      {fallback}
    </div>
  )
);
Avatar.displayName = "Avatar";

export { Avatar };
