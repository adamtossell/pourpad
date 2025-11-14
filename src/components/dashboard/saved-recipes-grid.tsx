"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import type { SavedRecipeSummary } from "@/lib/types/dashboard"
import { SavedRecipeExpandableCard } from "@/components/dashboard/saved-recipe-expandable-card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputLeftAddon, InputRightAddon } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SavedRecipesGridProps = {
  recipes: SavedRecipeSummary[]
}

export function SavedRecipesGrid({ recipes }: SavedRecipesGridProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("newest")

  const filteredRecipes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return recipes

    return recipes.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.description ?? "",
        recipe.author.displayName ?? "",
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
          <InputLeftAddon>
            <Search className="h-4 w-4" aria-hidden="true" />
          </InputLeftAddon>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved recipes"
            className="pl-9 pr-10"
            aria-label="Search saved recipes"
          />
          {query ? (
            <InputRightAddon>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </InputRightAddon>
          ) : null}
        </InputGroup>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="self-end" aria-label="Sort saved recipes">
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
          <SavedRecipeExpandableCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}

