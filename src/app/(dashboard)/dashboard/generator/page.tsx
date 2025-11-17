import { RecipeGeneratorSection } from "@/components/recipe-generator-section"

export default function DashboardGeneratorPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Create, save & share your daily pours</h1>
        <p className="text-muted-foreground text-sm">
          Build new brews, track your daily recipes, and revisit community favorites.
        </p>
      </header>

      <RecipeGeneratorSection />
    </div>
  )
}
