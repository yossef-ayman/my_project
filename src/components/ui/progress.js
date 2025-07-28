import React from "react"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary bg-gray-200", className)}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all bg-blue-600"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
