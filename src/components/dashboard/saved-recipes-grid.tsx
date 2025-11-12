import type { SavedRecipeSummary } from "@/lib/types/dashboard"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RecipeDetailsDialog } from "@/components/dashboard/recipe-details-dialog"

type SavedRecipesGridProps = {
  recipes: SavedRecipeSummary[]
}

export function SavedRecipesGrid({ recipes }: SavedRecipesGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-tight">Your saved recipes</h3>
        <p className="text-sm text-muted-foreground">
          Explore brews from the community you’ve bookmarked for later.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="flex h-full flex-col">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {recipe.author.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold tracking-tight">
                    {recipe.author.displayName}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {formatDate(recipe.createdAt)}
                  </span>
                </div>
                <Badge variant="outline" className="ml-auto rounded-full px-3 py-1 text-xs uppercase">
                  {recipe.brewerType}
                </Badge>
              </div>
              <CardTitle className="text-xl font-semibold tracking-tight">{recipe.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{truncate(recipe.description ?? "", 150) || "No description provided."}</p>
              <dl className="grid grid-cols-2 gap-3 text-xs uppercase tracking-wide">
                <div>
                  <dt className="text-muted-foreground">Coffee</dt>
                  <dd className="text-foreground text-sm font-semibold">
                    {formatNullable(recipe.metadata.coffeeWeight, (value) => `${value} g`) || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total time</dt>
                  <dd className="text-foreground text-sm font-semibold">
                    {formatNullable(recipe.metadata.totalBrewTimeSeconds, secondsToLabel) || "—"}
                  </dd>
                </div>
              </dl>
            </CardContent>

            <CardFooter className="mt-auto flex justify-end">
              <RecipeDetailsDialog
                recipe={{
                  id: recipe.id,
                  title: recipe.title,
                  createdAt: recipe.createdAt,
                  metadata: {
                    brewerType: recipe.brewerType,
                    description: recipe.metadata.description ?? recipe.description,
                    coffeeWeight: recipe.metadata.coffeeWeight,
                    grindSize: recipe.metadata.grindSize,
                    waterTemp: recipe.metadata.waterTemp,
                    totalBrewTimeSeconds: recipe.metadata.totalBrewTimeSeconds,
                  },
                  pours: recipe.pours ?? [],
                  author: recipe.author,
                }}
                triggerLabel="View recipe"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

function truncate(value: string, max = 140) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

function formatNullable<T>(value: T | null | undefined, formatter: (value: T) => string) {
  if (value == null) return null
  return formatter(value)
}

function secondsToLabel(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso))
}
