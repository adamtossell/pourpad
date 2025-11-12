import type { DailyBrewSummary, RecipeAuthor } from "@/lib/types/dashboard"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RecipeDetailsDialog } from "@/components/dashboard/recipe-details-dialog"

type DailyBrewsGridProps = {
  recipes: DailyBrewSummary[]
  author: RecipeAuthor
}

export function DailyBrewsGrid({ recipes, author }: DailyBrewsGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-tight">Card grid view</h3>
        <p className="text-sm text-muted-foreground">
          Visual snapshot of your brews with quick access to details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="flex h-full flex-col border">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase">
                  {recipe.brewerType}
                </Badge>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {formatDate(recipe.createdAt)}
                </span>
              </div>
              <CardTitle className="text-xl font-semibold tracking-tight">{recipe.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{truncate(recipe.description ?? "", 140) || "No notes saved."}</p>
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
                    description: recipe.description,
                    coffeeWeight: recipe.metadata.coffeeWeight,
                    grindSize: recipe.metadata.grindSize,
                    waterTemp: recipe.metadata.waterTemp,
                    totalBrewTimeSeconds: recipe.metadata.totalBrewTimeSeconds,
                  },
                  pours: recipe.pours,
                  author,
                }}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

function truncate(value: string, max = 120) {
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
