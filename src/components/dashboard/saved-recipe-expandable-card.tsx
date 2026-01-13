"use client"

import { useState } from "react"
import { Bookmark, Copy, Eye } from "lucide-react"

import type { SavedRecipeSummary } from "@/lib/types/dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipeDetailsResponsive } from "@/components/dashboard/recipe-details-responsive"

type SavedRecipeExpandableCardProps = {
  recipe: SavedRecipeSummary
}

export function SavedRecipeExpandableCard({ recipe }: SavedRecipeExpandableCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const totalWater = (recipe.pours ?? []).reduce((sum, pour) => sum + (pour.waterGrams ?? 0), 0)

  return (
    <Card key={recipe.id} className="flex h-full flex-col gap-1">
      <CardHeader className="gap-2 pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            {recipe.author.avatarUrl ? (
              <AvatarImage src={recipe.author.avatarUrl} alt={`${recipe.author.displayName}'s avatar`} />
            ) : null}
            <AvatarFallback className="text-xs">{recipe.author.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="text-sm font-semibold tracking-tight truncate">{recipe.author.displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(recipe.createdAt)}
            </span>
          </div>
          <Badge variant="outline" className="shrink-0 rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            {recipe.brewerType}
          </Badge>
        </div>
        <CardTitle className="text-lg font-medium tracking-tight leading-tight">{recipe.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground pb-2">
        <p className="line-clamp-2">{recipe.description ?? "No description provided."}</p>
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
      </CardFooter>

      <RecipeDetailsResponsive
        recipe={recipe}
        variant="saved-recipe"
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        actions={
          <>
            <Button variant="outline">
              <Bookmark className="h-4 w-4 mr-2" />
              Save recipe
            </Button>
            <Button>
              <Copy className="h-4 w-4 mr-2" />
              Use this recipe
            </Button>
          </>
        }
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
