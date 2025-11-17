import { SavedRecipesGrid } from "@/components/dashboard/saved-recipes-grid"
import { serverFetchJson } from "@/lib/server/fetch-json"
import type { SavedRecipeSummary } from "@/lib/types/dashboard"

type SavedBrewsPayload = {
  savedBrews: SavedRecipeSummary[]
}

export default async function DashboardSavedBrewsPage() {
  const { data, error } = await serverFetchJson<SavedBrewsPayload>("/api/dashboard/saved-brews")

  const savedBrews = data?.savedBrews ?? []

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Revisit your saved brews</h1>
        <p className="text-muted-foreground text-sm">
          Quickly find favourite recipes, compare notes, and bring standout cups back into rotation.
        </p>
        {error ? (
          <p className="text-sm text-rose-500">{error.payload && typeof error.payload === "object" && "error" in (error.payload as Record<string, unknown>) ? String((error.payload as Record<string, unknown>).error) : "Unable to load saved brews."}</p>
        ) : null}
      </header>

      <SavedRecipesGrid recipes={savedBrews} />
    </div>
  )
}
