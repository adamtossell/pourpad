import { LandingNavbar } from "@/components/landing-navbar"
import { RecipeGeneratorSection } from "@/components/recipe-generator-section"
import { PublicFiltersSection } from "@/components/public-filters-section"
import { RecipeList } from "@/components/recipe-list"
import { ListingPagination } from "@/components/listing-pagination"

export default function Home() {
  return (
    <div className="min-h-screen font-mono">
      <LandingNavbar />
      
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <RecipeGeneratorSection />
        
        <PublicFiltersSection />
        
        <RecipeList />
        
        <ListingPagination />
      </main>
    </div>
  )
}
