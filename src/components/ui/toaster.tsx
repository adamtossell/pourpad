"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "font-mono border border-border bg-background text-foreground",
        descriptionClassName: "text-sm text-muted-foreground",
        duration: 4000,
        closeButton: true,
        success: {
          className: "border-emerald-500 bg-emerald-50 text-emerald-700",
          descriptionClassName: "text-emerald-600",
        },
        error: {
          className: "border-rose-500 bg-rose-50 text-rose-600",
          descriptionClassName: "text-rose-500",
        },
      }}
    />
  )
}
