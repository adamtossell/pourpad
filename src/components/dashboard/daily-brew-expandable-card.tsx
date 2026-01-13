"use client"

import { useState } from "react"
import { Copy, Eye, Pencil } from "lucide-react"

import type { DailyBrewSummary } from "@/lib/types/dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DuplicateRecipeDialog } from "@/components/dashboard/duplicate-recipe-dialog"
import { EditRecipeDialog } from "@/components/dashboard/edit-recipe-dialog"
import { RecipeDetailsResponsive } from "@/components/dashboard/recipe-details-responsive"

type DailyBrewExpandableCardProps = {
  recipe: DailyBrewSummary
  onRecipeUpdate?: () => void
}

export function DailyBrewExpandableCard({ recipe, onRecipeUpdate }: DailyBrewExpandableCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)

  const totalWater = recipe.pours.reduce((sum, pour) => sum + (pour.waterGrams ?? 0), 0)

  return (
    <Card key={recipe.id} className="flex h-full flex-col gap-1">
      <CardHeader className="gap-2 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2 tracking-wide">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              {recipe.brewerType}
            </Badge>
            <Badge variant={recipe.isPublic ? "secondary" : "outline"} className="rounded-full px-2 py-1 text-xs">
              {recipe.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <span className="text-muted-foreground text-xs">{formatDateTime(recipe.createdAt)}</span>
        </div>
        <CardTitle className="text-lg font-medium tracking-tight leading-tight">{recipe.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground pb-2">
        <p className="line-clamp-2">{recipe.description ?? "No notes saved."}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground">
          {recipe.metadata.coffeeWeight && (
            <span>{recipe.metadata.coffeeWeight}g coffee</span>
          )}
          {recipe.metadata.coffeeWeight && totalWater > 0 && <span className="text-muted-foreground">/</span>}
          {totalWater > 0 && <span>{totalWater}g water</span>}
          {recipe.metadata.totalBrewTimeSeconds && (
            <>
              <span className="text-muted-foreground">/</span>
              <span>{secondsToLabel(recipe.metadata.totalBrewTimeSeconds)}</span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDetailsOpen(true)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsDuplicateDialogOpen(true)}
            aria-label="Duplicate recipe"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditDialogOpen(true)}
            aria-label="Edit recipe"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      <RecipeDetailsResponsive
        recipe={recipe}
        variant="daily-brew"
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailsOpen(false)
                setIsDuplicateDialogOpen(true)
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              onClick={() => {
                setIsDetailsOpen(false)
                setIsEditDialogOpen(true)
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </>
        }
      />

      <EditRecipeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        recipe={recipe}
        onSave={() => onRecipeUpdate?.()}
      />

      <DuplicateRecipeDialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        recipe={recipe}
        onSave={() => onRecipeUpdate?.()}
      />
    </Card>
  )
}

function secondsToLabel(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso))
}
