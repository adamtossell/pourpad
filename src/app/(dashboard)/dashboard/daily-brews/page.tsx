import { DailyBrewsSection } from "@/components/dashboard/daily-brews-section"
import { getMockDailyBrews } from "@/lib/mock/dashboard"

export default function DashboardDailyBrewsPage() {
  const dailyBrews = getMockDailyBrews()

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Stay on top of your daily brews</h1>
        <p className="text-muted-foreground text-sm">
          Review brew notes, dial in variables, and keep an eye on your recent pour history.
        </p>
      </header>

      <DailyBrewsSection recipes={dailyBrews} />
    </div>
  )
}
