"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AccountOverviewCard } from "@/components/account/account-overview-card"
import { AccountDisplayForm, notifyProfileUpdated } from "@/components/account/account-display-form"
import { AccountEmailForm } from "@/components/account/account-email-form"
import { AccountPasswordForm } from "@/components/account/account-password-form"
import { AccountDangerZone } from "@/components/account/account-danger-zone"
import type { AccountProfile } from "@/lib/types/account"

type AccountPageClientProps = {
  initialProfile: AccountProfile
  emailConfirmed?: boolean
}

export function AccountPageClient({ initialProfile, emailConfirmed }: AccountPageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [shouldBroadcast, setShouldBroadcast] = useState(false)

  useEffect(() => {
    if (emailConfirmed) {
      toast.success("Email updated")
      setShouldBroadcast(true)
    }
  }, [emailConfirmed])

  useEffect(() => {
    setProfile(initialProfile)
  }, [initialProfile])

  useEffect(() => {
    if (!shouldBroadcast) return

    notifyProfileUpdated({
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      email: profile.email,
      userId: profile.id,
    })

    setShouldBroadcast(false)
  }, [shouldBroadcast, profile])

  const handleProfileUpdated = (next: { displayName: string; avatarUrl: string | null }) => {
    setProfile((prev) => ({ ...prev, ...next }))
    setShouldBroadcast(true)
  }

  const handleEmailUpdated = (update: { email?: string }) => {
    if (typeof update.email === "string") {
      setProfile((previous) => ({ ...previous, email: update.email }))
      setShouldBroadcast(true)
    }
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
        <AccountEmailForm initialEmail={profile.email} onEmailChange={handleEmailUpdated} />
        <AccountPasswordForm />
      </div>
    </div>
  )
}
