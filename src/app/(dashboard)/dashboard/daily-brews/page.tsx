import { DailyBrewsSection } from "@/components/dashboard/daily-brews-section"
import { serverFetchJson } from "@/lib/server/fetch-json"
import type { DailyBrewSummary } from "@/lib/types/dashboard"

type DailyBrewsPayload = {
  dailyBrews: DailyBrewSummary[]
}

export default async function DashboardDailyBrewsPage() {
  const { data, error } = await serverFetchJson<DailyBrewsPayload>("/api/dashboard/daily-brews")

  const dailyBrews = data?.dailyBrews ?? []

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Stay on top of your daily brews</h1>
        <p className="text-muted-foreground text-sm">
          Review brew notes, dial in variables, and keep an eye on your recent pour history.
        </p>
        {error ? (
          <p className="text-sm text-rose-500">{error.payload && typeof error.payload === "object" && "error" in (error.payload as Record<string, unknown>) ? String((error.payload as Record<string, unknown>).error) : "Unable to load daily brews."}</p>
        ) : null}
      </header>

      <DailyBrewsSection recipes={dailyBrews} />
    </div>
  )
}
