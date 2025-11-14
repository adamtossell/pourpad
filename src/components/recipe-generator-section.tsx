import { getCurrentUser } from "@/lib/auth/get-current-user"
import { RecipeGeneratorForm } from "@/components/recipe-generator-form"

export async function RecipeGeneratorSection() {
  const user = await getCurrentUser()

  return (
    <section className="space-y-6">

      <RecipeGeneratorForm userId={user?.id ?? null} />
    </section>
  )
}
