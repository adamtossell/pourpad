"use client"

import * as React from "react"

import type { RecipeDetail } from "@/lib/types/dashboard"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

type RecipeDetailsDialogProps = {
  recipe: RecipeDetail
  triggerLabel?: string
}

export function RecipeDetailsDialog({ recipe, triggerLabel = "View details" }: RecipeDetailsDialogProps) {
  const pours = React.useMemo(
    () => [...recipe.pours].sort((a, b) => a.order - b.order),
    [recipe.pours],
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader className="space-y-4 text-left">
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {formatDate(recipe.createdAt)}
            </span>
            <AlertDialogTitle className="text-2xl font-semibold tracking-tight">
              {recipe.title}
            </AlertDialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              {recipe.metadata.brewerType}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              Brewed by {recipe.author.displayName}
            </Badge>
          </div>
          {recipe.metadata.description ? (
            <AlertDialogDescription className="text-left text-sm leading-relaxed text-muted-foreground">
              {recipe.metadata.description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <section className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Brew metrics
          </h3>
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
            <MetadataRow label="Coffee" value={formatNullableWeight(recipe.metadata.coffeeWeight)} />
            <MetadataRow label="Grind" value={recipe.metadata.grindSize} />
            <MetadataRow label="Water temp" value={formatNullableTemperature(recipe.metadata.waterTemp)} />
            <MetadataRow label="Total time" value={formatNullableDuration(recipe.metadata.totalBrewTimeSeconds)} />
          </div>
        </section>

        <Separator className="my-6" />

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pour schedule
          </h3>
          <ul className="space-y-3">
            {pours.map((pour) => (
              <li key={pour.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase">
                      Pour {pour.order + 1}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatNullableDuration(pourDuration(pour.startTimeSeconds, pour.endTimeSeconds))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{formatNullableWeight(pour.waterGrams)}</span>
                    <span className="text-muted-foreground">water</span>
                  </div>
                </div>
                <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {formatNullableTimestamp(pour.startTimeSeconds)}
                  {pour.endTimeSeconds !== null ? ` → ${formatNullableTimestamp(pour.endTimeSeconds)}` : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogAction autoFocus>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
