"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import type { CurrentUser } from "@/lib/auth/get-current-user"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

type DashboardShellProps = {
  user: CurrentUser
  children: ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Pourpad
          </Link>

          <UserMenu user={user} />
        </div>
      </header>

      <DashboardNav />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10">
        {children}
      </main>

      <Separator className="mt-auto" />
      <footer className="mx-auto w-full max-w-7xl px-6 py-6 text-sm text-muted-foreground">
        Brew better every day.
      </footer>
    </div>
  )
}
