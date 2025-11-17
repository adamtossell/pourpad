"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type DashboardNavItem = {
  href: string
  label: string
  isActive: (pathname: string) => boolean
}

const navItems: DashboardNavItem[] = [
  {
    href: "/dashboard/generator",
    label: "Generator",
    isActive: (pathname) => pathname === "/dashboard" || pathname.startsWith("/dashboard/generator"),
  },
  {
    href: "/dashboard/daily-brews",
    label: "Daily brews",
    isActive: (pathname) => pathname.startsWith("/dashboard/daily-brews"),
  },
  {
    href: "/dashboard/saved-brews",
    label: "Saved brews",
    isActive: (pathname) => pathname.startsWith("/dashboard/saved-brews"),
  },
  {
    href: "/account",
    label: "Account",
    isActive: (pathname) => pathname === "/account" || pathname.startsWith("/account/"),
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-background">
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 px-6 py-3">
        {navItems.map((item) => {
          const active = item.isActive(pathname ?? "")

          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "outline" : "ghost"}
              className={cn("font-medium tracking-tight", active && "bg-card")}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
