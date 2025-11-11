import Link from "next/link"

import { Button } from "@/components/ui/button"

export function LandingNavbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium tracking-tight font-sans">
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
            <Button asChild variant="outline" className="font-medium tracking-tight">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="default" className="font-medium tracking-tight">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}