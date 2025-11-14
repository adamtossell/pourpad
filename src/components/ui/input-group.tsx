import * as React from "react"

import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex w-full items-center", className)} {...props} />
  ),
)
InputGroup.displayName = "InputGroup"

const InputLeftAddon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
)
InputLeftAddon.displayName = "InputLeftAddon"

const InputRightAddon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute inset-y-0 right-0 flex items-center pr-2", className)}
      {...props}
    />
  ),
)
InputRightAddon.displayName = "InputRightAddon"

export { InputGroup, InputLeftAddon, InputRightAddon }
