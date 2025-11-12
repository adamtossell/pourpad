import { getCurrentUser } from "@/lib/auth/get-current-user"
import { RecipeGeneratorForm } from "@/components/recipe-generator-form"

export async function RecipeGeneratorSection() {
  const user = await getCurrentUser()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Create, save & share your daily pours</h1>
        <p className="mt-2 text-muted-foreground">Create and share your perfect coffee recipe</p>
      </div>

      <RecipeGeneratorForm userId={user?.id ?? null} />
    </section>
  )
}
