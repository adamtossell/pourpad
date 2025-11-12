import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/get-current-user"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
