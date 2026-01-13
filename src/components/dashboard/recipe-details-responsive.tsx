"use client"

import * as React from "react"

import type { DailyBrewSummary, SavedRecipeSummary } from "@/lib/types/dashboard"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
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
  headerAction?: React.ReactNode
  footerAction?: React.ReactNode
}

export function RecipeDetailsResponsive({
  recipe,
  variant,
  open,
  onOpenChange,
  headerAction,
  footerAction,
}: RecipeDetailsResponsiveProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <div className="flex items-center justify-between gap-4">
              <AlertDialogTitle className="text-xl font-medium tracking-tight">
                {recipe.title}
              </AlertDialogTitle>
              {headerAction}
            </div>
          </AlertDialogHeader>
          <RecipeDetailsContent recipe={recipe} variant={variant} />
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {footerAction}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between gap-4">
            <DrawerTitle className="text-xl font-medium tracking-tight">
              {recipe.title}
            </DrawerTitle>
            {headerAction}
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <RecipeDetailsContent recipe={recipe} variant={variant} />
        </div>
        <DrawerFooter className="gap-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
          {footerAction}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
