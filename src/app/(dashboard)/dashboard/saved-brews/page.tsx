import { SavedRecipesGrid } from "@/components/dashboard/saved-recipes-grid"
import { getMockSavedBrews } from "@/lib/mock/dashboard"

export default function DashboardSavedBrewsPage() {
  const savedBrews = getMockSavedBrews()

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Revisit your saved brews</h1>
        <p className="text-muted-foreground text-sm">
          Quickly find favourite recipes, compare notes, and bring standout cups back into rotation.
        </p>
      </header>

      <SavedRecipesGrid recipes={savedBrews} />
    </div>
  )
}
