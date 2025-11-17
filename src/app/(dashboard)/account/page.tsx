import { serverFetchJson } from "@/lib/server/fetch-json"
import type { AccountProfileResponse } from "@/lib/types/account"
import { AccountPageClient } from "@/components/account/account-page-client"

export default async function AccountPage() {
  const { data, error } = await serverFetchJson<AccountProfileResponse>("/api/account/profile")

  if (error || !data?.profile) {
    return (
      <div className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Account</h1>
          <p className="text-muted-foreground text-sm">
            Update your profile, manage login credentials, and control your data.
          </p>
        </header>
        <p className="text-sm text-rose-500">{extractErrorMessage(error)}</p>
      </div>
    )
  }

  const profile = data.profile

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Account</h1>
        <p className="text-muted-foreground text-sm">
          Update your profile, manage login credentials, and control your data.
        </p>
      </header>

      <AccountPageClient initialProfile={profile} />
    </div>
  )
}

function extractErrorMessage(error: unknown): string {
  if (!error) return "Unable to load account details."
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message

  if (typeof error === "object" && error !== null && "payload" in error) {
    const payload = (error as { payload?: unknown }).payload
    if (payload && typeof payload === "object" && "error" in payload) {
      return String((payload as Record<string, unknown>).error)
    }
  }

  return "Unable to load account details."
}
