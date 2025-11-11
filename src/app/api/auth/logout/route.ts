import { NextResponse } from "next/server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  const supabase = await createRouteHandlerSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status ?? 400 }
    )
  }

  return NextResponse.json({ success: true })
}
