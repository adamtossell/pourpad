import { getCurrentUser } from "@/lib/auth/get-current-user"
import { AccountOverviewCard } from "@/components/account/account-overview-card"
import { AccountDisplayForm } from "@/components/account/account-display-form"
import { AccountEmailForm } from "@/components/account/account-email-form"
import { AccountPasswordForm } from "@/components/account/account-password-form"
import { AccountDangerZone } from "@/components/account/account-danger-zone"

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const joinedAt = new Date().toISOString()

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Account</h1>
        <p className="text-muted-foreground text-sm">
          Update your profile, manage login credentials, and control your data.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <AccountOverviewCard
            displayName={user.displayName}
            email={user.email}
            joinedAt={joinedAt}
            avatarInitial={user.firstInitial}
          />
          <AccountDangerZone />
        </div>

        <div className="space-y-6">
          <AccountDisplayForm initialDisplayName={user.displayName} initialAvatarUrl={null} />
          <AccountEmailForm initialEmail={user.email} />
          <AccountPasswordForm />
        </div>
      </div>
    </div>
  )
}
