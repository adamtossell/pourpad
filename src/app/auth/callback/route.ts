import { NextResponse } from "next/server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"

const DEFAULT_REDIRECT = "/account?email-confirmed=1"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const redirectParam = url.searchParams.get("redirect")
  const type = url.searchParams.get("type")

  const supabase = await createRouteHandlerSupabaseClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("Failed to exchange code for session", error)
      return NextResponse.redirect(buildRedirect(url, "/login?error=email-confirm"))
    }
  }

  const safeRedirect = sanitizeRedirect(redirectParam, type)
  return NextResponse.redirect(buildRedirect(url, safeRedirect))
}

function sanitizeRedirect(redirect: string | null, type: string | null): string {
  if (redirect && redirect.startsWith("/")) {
    return redirect
  }

  if (type === "signup") {
    return "/"
  }

  return DEFAULT_REDIRECT
}

function buildRedirect(currentUrl: URL, path: string) {
  return new URL(path, currentUrl.origin)
}
