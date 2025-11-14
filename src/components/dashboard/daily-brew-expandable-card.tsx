"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import type { DailyBrewSummary } from "@/lib/types/dashboard"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type DailyBrewExpandableCardProps = {
  recipe: DailyBrewSummary
}

export function DailyBrewExpandableCard({ recipe }: DailyBrewExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card key={recipe.id} className="flex h-full flex-col gap-1">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2 tracking-wide">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              {recipe.isPublic ? "Public" : "Private"}
            </span>
            <span className="text-muted-foreground text-xs">{formatDateTime(recipe.createdAt)}</span>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            {recipe.brewerType}
          </Badge>
        </div>
        <CardTitle className="text-xl font-medium tracking-tight">{recipe.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{recipe.description ?? "No notes saved."}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm uppercase tracking-wide">
          <Metric label="Coffee" value={formatNullable(recipe.metadata.coffeeWeight, (value) => `${value} g`)} />
          <Metric label="Grind" value={recipe.metadata.grindSize ?? "—"} />
          <Metric label="Water temp" value={formatNullable(recipe.metadata.waterTemp, (value) => `${value} °C`)} />
          <Metric
            label="Total time"
            value={formatNullable(recipe.metadata.totalBrewTimeSeconds, secondsToLabel)}
          />
        </dl>
      </CardContent>

      <CardFooter className="mt-2 flex flex-col items-stretch gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          Pour schedule
          <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
        </Button>
        {isOpen ? (
          <div className="w-full overflow-hidden rounded-lg border">
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
                {recipe.pours.map((pour) => (
                  <TableRow key={pour.id}>
                    <TableCell className="font-medium">Pour {pour.order + 1}</TableCell>
                    <TableCell>{formatNullableTimestamp(pour.startTimeSeconds)}</TableCell>
                    <TableCell>{formatNullableTimestamp(pour.endTimeSeconds)}</TableCell>
                    <TableCell>
                      {formatNullableDuration(pourDuration(pour.startTimeSeconds, pour.endTimeSeconds))}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNullable(pour.waterGrams, (value) => `${value} g`)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  )
}

type MetricProps = {
  label: string
  value: string | null
}

const Metric = ({ label, value }: MetricProps) => (
  <div className="space-y-0.5">
    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="text-sm font-semibold tracking-tight text-foreground">{value ?? "—"}</dd>
  </div>
)

function formatNullable<T>(value: T | null | undefined, formatter: (value: T) => string) {
  if (value == null) return null
  return formatter(value)
}

function secondsToLabel(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatNullableDuration(seconds: number | null) {
  if (seconds == null) return null
  return secondsToLabel(seconds)
}

function formatNullableTimestamp(seconds: number | null) {
  if (seconds == null) return "—"
  return secondsToLabel(seconds)
}

function pourDuration(start: number | null, end: number | null) {
  if (start == null || end == null) return null
  return Math.max(end - start, 0)
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso))
}
