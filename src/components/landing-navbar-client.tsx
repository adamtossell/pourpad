"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import type { CurrentUser } from "@/lib/auth/get-current-user"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import {
  PROFILE_EVENT_NAME,
  PROFILE_STORAGE_KEY,
  type ProfileBroadcastEventDetail,
  type ProfileBroadcastPayload,
} from "@/components/account/account-display-form"

type LandingNavbarClientProps = {
  initialUser: CurrentUser | null
}

export function LandingNavbarClient({ initialUser }: LandingNavbarClientProps) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser)

  useEffect(() => {
    if (typeof window === "undefined") return

    const applyProfile = (payload: ProfileBroadcastPayload) => {
      setUser((prev) => {
        const resolvedId = payload.userId || prev?.id || initialUser?.id || ""
        const next = {
          id: resolvedId,
          email: payload.email,
          displayName: payload.displayName,
          firstInitial: getInitial(payload.displayName, payload.email),
          avatarUrl: payload.avatarUrl,
        }

        return prev ? { ...prev, ...next } : next
      })
    }

    const clearProfile = () => {
      setUser(null)
    }

    const readStoredProfile = () => {
      try {
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw) as ProfileBroadcastPayload
        applyProfile(parsed)
      } catch {
        // ignore malformed storage
      }
    }

    const handleProfileEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return
      const detail = event.detail as ProfileBroadcastEventDetail
      if (!detail) {
        clearProfile()
        return
      }
      applyProfile(detail)
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === PROFILE_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as ProfileBroadcastPayload
          applyProfile(parsed)
        } catch {
          // ignore
        }
      } else if (event.key === PROFILE_STORAGE_KEY && event.newValue === null) {
        clearProfile()
      }
    }

    readStoredProfile()

    window.addEventListener(PROFILE_EVENT_NAME, handleProfileEvent as EventListener)
    window.addEventListener("storage", handleStorageEvent)

    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME, handleProfileEvent as EventListener)
      window.removeEventListener("storage", handleStorageEvent)
    }
  }, [initialUser?.id])

  return (
    <header className="border-b">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium tracking-tight font-sans">Pourpad</div>

          <div className="flex items-center gap-6">
            <Button variant="ghost" className="font-medium tracking-tight">
              Recipes
            </Button>
            <Button variant="ghost" className="font-medium tracking-tight">
              About
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Button asChild variant="outline" className="font-medium tracking-tight">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild variant="default" className="font-medium tracking-tight">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

function getInitial(displayName: string, email: string): string {
  const trimmed = displayName.trim()
  if (trimmed.length > 0) {
    return trimmed[0]!.toUpperCase()
  }
  return email.trim()[0]?.toUpperCase() ?? "U"
}
