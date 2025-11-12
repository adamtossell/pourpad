"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import type { CurrentUser } from "@/lib/auth/get-current-user"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"

type DashboardShellProps = {
  user: CurrentUser
  children: React.ReactNode
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/account", label: "Account" },
]

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Pourpad
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={cn("font-medium tracking-tight", isActive && "shadow-sm")}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              )
            })}
          </nav>

          <UserMenu user={user} />
        </div>
      </header>

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
