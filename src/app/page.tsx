import { LandingNavbar } from "@/components/landing-navbar"
import { RecipeGeneratorSection } from "@/components/recipe-generator-section"
import { PublicRecipesSection } from "@/components/public-recipes-section"

export default function Home() {
  return (
    <div className="min-h-screen font-mono">
      <LandingNavbar />
      
      <main className="mx-auto max-w-7xl space-y-16 px-6 py-10">
        <RecipeGeneratorSection />
        
        <PublicRecipesSection />
      </main>
    </div>
  )
}
