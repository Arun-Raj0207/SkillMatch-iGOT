import React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)} {...props}>
    <div className="h-full w-full flex-1 bg-primary transition-transform duration-500" style={{ transform: `translateX(-${100 - Math.max(0, Math.min(100, value ?? 0))}%)` }} />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
