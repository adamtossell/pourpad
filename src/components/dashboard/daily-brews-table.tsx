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
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-tight">Table view</h3>
        <p className="text-sm text-muted-foreground">
          Compare your brews by date, notes, and saved metrics.
        </p>
      </div>
      <Table className="rounded-xl border">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Title</TableHead>
            <TableHead>Brewer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="max-w-sm">Tasting notes</TableHead>
            <TableHead className="w-[120px] text-right">Details</TableHead>
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
              <TableCell className="text-sm text-muted-foreground">
                {truncate(recipe.description ?? "", 110) || "—"}
              </TableCell>
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
    </div>
  )
}

function truncate(value: string, max = 100) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso))
}
