import { LandingNavbar } from "@/components/landing-navbar"
import { RecipeGeneratorSection } from "@/components/recipe-generator-section"
import { PublicRecipesSection } from "@/components/public-recipes-section"

export default function Home() {
  return (
    <div className="min-h-screen font-mono">
      <LandingNavbar />
      
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      <div> 
        <h1 className="text-3xl font-medium tracking-tight">Create, save & share your daily pours</h1>
        <p className="mt-2 text-muted-foreground">Create and share your perfect coffee recipe</p>
      </div>
    
        <RecipeGeneratorSection />
        
        <PublicRecipesSection />
      </main>
    </div>
  )
}
