import Link from "next/link"
import type { Metadata } from "next"

import { Coffee } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Log in | Pourpad",
  description: "Access your Pourpad account to manage and share your recipes.",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium font-sans">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Coffee className="size-4" />
          </div>
          Pourpad
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
