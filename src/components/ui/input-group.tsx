import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group/input flex w-full items-stretch overflow-hidden rounded-[var(--radius,0.75rem)] border border-input bg-white text-foreground shadow-xs",
        className,
      )}
      {...props}
    />
  ),
)
InputGroup.displayName = "InputGroup"

type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "inline-start" | "inline-end"
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-end", ...props }, ref) => (
    <div
      ref={ref}
      data-align={align}
      className={cn(
        "flex items-center gap-1 bg-transparent px-1.5",
        align === "inline-start" ? "border-r border-border/60" : "border-l border-border/60",
        className,
      )}
      {...props}
    />
  ),
)
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn(
        "flex-1 border-0 bg-white px-3 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className,
      )}
      {...props}
    />
  ),
)
InputGroupInput.displayName = "InputGroupInput"

const InputGroupButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, size = "sm", variant = "ghost", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      className={cn(
        "h-8 rounded-[calc(var(--radius,0.75rem)-2px)] px-3 text-xs font-medium",
        className,
      )}
      {...props}
    />
  ),
)
InputGroupButton.displayName = "InputGroupButton"

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput }
