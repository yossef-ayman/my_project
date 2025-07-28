import { cn } from "../../lib/utils"

const Badge = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-primary hover:bg-primary/80 bg-blue-600 text-white",
    secondary: "bg-secondary hover:bg-secondary/80 bg-gray-100 text-gray-900",
    destructive: "bg-destructive hover:bg-destructive/80 bg-red-600 text-white",
    outline: "text-foreground border border-gray-300",
  }

  const sizes = {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
