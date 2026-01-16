"use client"

import * as React from "react"

import type { DailyBrewSummary, SavedRecipeSummary } from "@/lib/types/dashboard"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type RecipeDetailsContentProps = {
  recipe: DailyBrewSummary | SavedRecipeSummary
  variant: "daily-brew" | "saved-recipe"
}

export function RecipeDetailsContent({ recipe, variant }: RecipeDetailsContentProps) {
  const pours = React.useMemo(() => {
    const pourList = recipe.pours ?? []
    return [...pourList].sort((a, b) => a.order - b.order)
  }, [recipe.pours])

  const author = variant === "saved-recipe" ? (recipe as SavedRecipeSummary).author : null
  const isPublic = variant === "daily-brew" ? (recipe as DailyBrewSummary).isPublic : null

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            {variant === "daily-brew" ? (recipe as DailyBrewSummary).brewerType : (recipe as SavedRecipeSummary).brewerType}
          </Badge>
          {isPublic !== null && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {isPublic ? "Public" : "Private"}
            </Badge>
          )}
          {author && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              by {author.displayName}
            </Badge>
          )}
        </div>
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatDate(recipe.createdAt)}
        </span>
      </div>

      {recipe.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>
      ) : null}

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Recipe details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetadataRow label="Coffee" value={recipe.metadata.coffeeName} />
          <MetadataRow label="Coffee weight" value={formatNullableWeight(recipe.metadata.coffeeWeight)} />
          <MetadataRow label="Coffee filter" value={recipe.metadata.coffeeFilterName} />
          <MetadataRow label="Grind size" value={recipe.metadata.grindSize} />
          <MetadataRow label="Grinder" value={recipe.metadata.grinderName} />
          <MetadataRow label="Water temp" value={formatNullableTemperature(recipe.metadata.waterTemp)} />
          <MetadataRow label="Total time" value={formatNullableDuration(recipe.metadata.totalBrewTimeSeconds)} />
        </div>
      </section>

      {pours.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Pour schedule
            </h3>
            <div className="overflow-hidden rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pour</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Water</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pours.map((pour) => (
                    <TableRow key={pour.id}>
                      <TableCell className="font-medium">Pour {pour.order + 1}</TableCell>
                      <TableCell>{formatNullableTimestamp(pour.startTimeSeconds)}</TableCell>
                      <TableCell>{formatNullableTimestamp(pour.endTimeSeconds)}</TableCell>
                      <TableCell>
                        {formatNullableDuration(pourDuration(pour.startTimeSeconds, pour.endTimeSeconds))}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatNullableWeight(pour.waterGrams)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

type MetadataRowProps = {
  label: string
  value?: string | null
}

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tracking-tight">{value ?? "—"}</p>
    </div>
  )
}

function formatNullableWeight(weight?: number | null) {
  if (weight == null) return null
  return `${weight} g`
}

function formatNullableTemperature(temp?: number | null) {
  if (temp == null) return null
  return `${temp} °C`
}

function formatNullableDuration(seconds?: number | null) {
  if (seconds == null) return null
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatNullableTimestamp(seconds?: number | null) {
  if (seconds == null) return "—"
  return formatNullableDuration(seconds)
}

function pourDuration(start: number | null, end: number | null) {
  if (start == null || end == null) return null
  return Math.max(end - start, 0)
}

function formatDate(isoString: string) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
