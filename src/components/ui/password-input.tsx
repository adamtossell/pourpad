"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  toggleLabel?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, toggleLabel = "Toggle password visibility", ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false)

    const handleToggle = () => {
      setIsVisible((previous) => !previous)
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={handleToggle}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 flex items-center justify-center"
          aria-label={isVisible ? "Hide password" : toggleLabel}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = "PasswordInput"
