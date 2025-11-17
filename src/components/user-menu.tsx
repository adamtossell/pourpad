"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"

import { Bookmark, CirclePlus, Coffee, LogOut, User } from "lucide-react"

import { logoutAction } from "@/app/actions/logout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PROFILE_EVENT_NAME,
  PROFILE_STORAGE_KEY,
  clearProfileBroadcast,
  type ProfileBroadcastEventDetail,
  type ProfileBroadcastPayload,
} from "@/components/account/account-display-form"

type UserMenuProps = {
  user: {
    displayName: string
    email: string
    firstInitial: string
    avatarUrl: string | null
    id?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()
  const [currentUser, setCurrentUser] = useState<typeof user | null>(user)

  useEffect(() => {
    setCurrentUser(user)
  }, [user])

  useEffect(() => {
    const applyProfile = (payload: ProfileBroadcastPayload) => {
      setCurrentUser((prev) => ({
        displayName: payload.displayName,
        email: payload.email,
        firstInitial: getInitial(payload.displayName, payload.email),
        avatarUrl: payload.avatarUrl,
        id: payload.userId ?? prev?.id,
      }))
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

    const handleCustomEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return
      const detail = event.detail as ProfileBroadcastEventDetail
      if (!detail) {
        setCurrentUser(null)
        return
      }
      applyProfile(detail)
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== PROFILE_STORAGE_KEY) return

      if (event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as ProfileBroadcastPayload
          applyProfile(parsed)
        } catch {
          // ignore
        }
      } else {
        setCurrentUser(null)
      }
    }

    if (typeof window === "undefined") {
      return
    }

    readStoredProfile()
    window.addEventListener(PROFILE_EVENT_NAME, handleCustomEvent as EventListener)
    window.addEventListener("storage", handleStorageEvent)

    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME, handleCustomEvent as EventListener)
      window.removeEventListener("storage", handleStorageEvent)
    }
  }, [])

  const handleLogout = () => {
    clearProfileBroadcast()
    setCurrentUser(null)
    startTransition(() => {
      void logoutAction()
    })
  }

  if (!currentUser) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="border-input hover:bg-muted focus-visible:ring-ring flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Open user menu"
          data-state={isPending ? "pending" : undefined}
        >
          <Avatar className="h-9 w-9">
            {currentUser.avatarUrl ? (
              <AvatarImage src={currentUser.avatarUrl} alt={`${currentUser.displayName}'s avatar`} />
            ) : null}
            <AvatarFallback>{currentUser.firstInitial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{currentUser.displayName}</span>
          <span className="text-muted-foreground text-xs font-normal truncate">{currentUser.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/dashboard/generator" className="flex w-full items-center">
            <CirclePlus className="h-4 w-4" />
            <span className="ml-2">Make a brew</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/dashboard/daily-brews" className="flex w-full items-center">
            <Coffee className="h-4 w-4" />
            <span className="ml-2">Your brews</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/dashboard/saved-brews" className="flex w-full items-center">
            <Bookmark className="h-4 w-4" />
            <span className="ml-2">Saved brews</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/account" className="flex w-full items-center">
            <User className="h-4 w-4" />
            <span className="ml-2">Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
          className="text-rose-600 focus:text-rose-600 gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getInitial(displayName: string, email: string): string {
  const trimmed = displayName.trim()
  if (trimmed.length > 0) {
    return trimmed[0]!.toUpperCase()
  }
  return email.trim()[0]?.toUpperCase() ?? "U"
}
