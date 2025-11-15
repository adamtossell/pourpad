"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import type { DailyBrewSummary } from "@/lib/types/dashboard"
import { DailyBrewExpandableCard } from "@/components/dashboard/daily-brew-expandable-card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type DailyBrewsGridProps = {
  recipes: DailyBrewSummary[]
}

export function DailyBrewsGrid({ recipes }: DailyBrewsGridProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("newest")

  const filteredRecipes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return recipes

    return recipes.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.description ?? "",
        recipe.metadata.grindSize ?? "",
        recipe.metadata.brewerType,
      ]

      return haystack.some((value) => value.toLowerCase().includes(normalized))
    })
  }, [query, recipes])

  const sortedRecipes = useMemo(() => {
    const copy = [...filteredRecipes]
    switch (sort) {
      case "oldest":
        return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "az":
        return copy.sort((a, b) => a.title.localeCompare(b.title))
      case "za":
        return copy.sort((a, b) => b.title.localeCompare(a.title))
      case "newest":
      default:
        return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }, [filteredRecipes, sort])

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your brews"
            aria-label="Search daily brews"
            className="pl-1"
          />
          {query ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="self-end" aria-label="Sort daily brews">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="az">Title A-Z</SelectItem>
            <SelectItem value="za">Title Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedRecipes.map((recipe) => (
          <DailyBrewExpandableCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
