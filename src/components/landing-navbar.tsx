import { Button } from "@/components/ui/button"

export function LandingNavbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium tracking-tight">
            Pourpad
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="font-medium tracking-tight">
              Recipes
            </Button>
            <Button variant="ghost" className="font-medium tracking-tight">
              About
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-medium tracking-tight">
              Log in
            </Button>
            <Button variant="default" className="font-medium tracking-tight">
              Sign up
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}
