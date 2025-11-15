import { NextResponse } from "next/server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { ApiErrorResponse } from "@/lib/types/recipes"
import type { DefaultGrinderListResponse } from "@/lib/types/grinders"

export async function GET() {
  const supabase = await createRouteHandlerSupabaseClient()

  const { data, error } = await supabase
    .from("default_grinders")
    .select("id, model, brand, scale_type, default_notation, metadata, created_at")
    .order("model", { ascending: true })

  if (error) {
    console.error("Failed to load default grinders", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to load grinders" },
      { status: 500 },
    )
  }

  const grinders =
    data?.map((grinder) => ({
      id: grinder.id,
      model: grinder.model,
      brand: grinder.brand,
      scaleType: grinder.scale_type,
      defaultNotation: grinder.default_notation,
      metadata: grinder.metadata,
      createdAt: grinder.created_at,
    })) ?? []

  return NextResponse.json<DefaultGrinderListResponse>({ grinders })
}
