"use client"

import * as React from "react"

import type { DailyBrewSummary, SavedRecipeSummary } from "@/lib/types/dashboard"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { RecipeDetailsContent } from "@/components/dashboard/recipe-details-content"

type RecipeDetailsResponsiveProps = {
  recipe: DailyBrewSummary | SavedRecipeSummary
  variant: "daily-brew" | "saved-recipe"
  open: boolean
  onOpenChange: (open: boolean) => void
  actions?: React.ReactNode
}

export function RecipeDetailsResponsive({
  recipe,
  variant,
  open,
  onOpenChange,
  actions,
}: RecipeDetailsResponsiveProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-tight">
              {recipe.title}
            </DialogTitle>
          </DialogHeader>
          <RecipeDetailsContent recipe={recipe} variant={variant} />
          {actions && (
            <DialogFooter className="gap-2">
              {actions}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-medium tracking-tight">
            {recipe.title}
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <RecipeDetailsContent recipe={recipe} variant={variant} />
        </div>
        <DrawerFooter className="gap-2">
          {actions}
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
