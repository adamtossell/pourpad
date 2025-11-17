"use client"

import { useState } from "react"

import { AccountOverviewCard } from "@/components/account/account-overview-card"
import { AccountDisplayForm } from "@/components/account/account-display-form"
import { AccountEmailForm } from "@/components/account/account-email-form"
import { AccountPasswordForm } from "@/components/account/account-password-form"
import { AccountDangerZone } from "@/components/account/account-danger-zone"
import type { AccountProfile } from "@/lib/types/account"

type AccountPageClientProps = {
  initialProfile: AccountProfile
}

export function AccountPageClient({ initialProfile }: AccountPageClientProps) {
  const [profile, setProfile] = useState(initialProfile)

  const handleProfileUpdated = (next: { displayName: string; avatarUrl: string | null }) => {
    setProfile((prev) => ({ ...prev, ...next }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <div className="space-y-6">
        <AccountOverviewCard
          displayName={profile.displayName}
          email={profile.email}
          joinedAt={profile.joinedAt}
          avatarInitial={profile.displayName.slice(0, 1).toUpperCase()}
          avatarUrl={profile.avatarUrl}
        />
        <AccountDangerZone />
      </div>

      <div className="space-y-6">
        <AccountDisplayForm
          initialDisplayName={profile.displayName}
          initialAvatarUrl={profile.avatarUrl}
          email={profile.email}
          userId={profile.id}
          onProfileUpdated={handleProfileUpdated}
        />
        <AccountEmailForm initialEmail={profile.email} />
        <AccountPasswordForm />
      </div>
    </div>
  )
}
