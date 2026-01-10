import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/50 rounded-xl shimmer", className)}
      {...props} />
  );
}

export { Skeleton }
