import type { DailyBrewSummary, RecipeAuthor } from "@/lib/types/dashboard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RecipeDetailsDialog } from "@/components/dashboard/recipe-details-dialog"

type DailyBrewsTableProps = {
  recipes: DailyBrewSummary[]
  author: RecipeAuthor
}

export function DailyBrewsTable({ recipes, author }: DailyBrewsTableProps) {
  return (
    <Table className="rounded-xl border">
      <TableHeader>
        <TableRow className="bg-muted/60">
          <TableHead>Title</TableHead>
          <TableHead>Brewer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Coffee</TableHead>
          <TableHead>Grind</TableHead>
          <TableHead>Water temp</TableHead>
          <TableHead>Total time</TableHead>
          <TableHead className="w-[110px] text-right">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id} className="odd:bg-background even:bg-muted/20">
            <TableCell className="font-medium">{recipe.title}</TableCell>
            <TableCell>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase">
                {recipe.brewerType}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{formatDate(recipe.createdAt)}</TableCell>
            <TableCell>{formatNullable(recipe.metadata.coffeeWeight, (value) => `${value} g`)}</TableCell>
            <TableCell>{recipe.metadata.grindSize ?? "—"}</TableCell>
            <TableCell>{formatNullable(recipe.metadata.waterTemp, (value) => `${value} °C`)}</TableCell>
            <TableCell>{formatNullable(recipe.metadata.totalBrewTimeSeconds, secondsToLabel)}</TableCell>
            <TableCell className="text-right">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso))
}

function formatNullable<T>(value: T | null | undefined, formatter: (value: T) => string) {
  if (value == null) return "—"
  return formatter(value)
}

function secondsToLabel(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
