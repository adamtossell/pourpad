export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted/80" />
      </div>
      <div className="space-y-6">
        <div className="h-10 w-72 rounded-full bg-muted" />
        <div className="space-y-4">
          <div className="h-56 rounded-xl border bg-muted/20" />
          <div className="h-56 rounded-xl border bg-muted/20" />
        </div>
      </div>
    </div>
  )
}
