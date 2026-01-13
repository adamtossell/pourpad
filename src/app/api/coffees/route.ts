import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { ApiErrorResponse } from "@/lib/types/recipes"
import type { CoffeeListResponse, CoffeeCreateResponse, UserCoffee } from "@/lib/types/coffees"
import { coffeeCreateSchema } from "@/lib/validators/coffee"

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const
const MAX_FILE_BYTES = 5 * 1024 * 1024

export async function GET() {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to fetch session", authError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Unable to validate session" },
      { status: 500 },
    )
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "You must be logged in" },
      { status: 401 },
    )
  }

  const { data, error } = await supabase
    .from("user_coffees")
    .select("id, name, roaster, origin, roast_level, process_type, roasted_date, taste_profile, notes, image_path, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load coffees", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to load coffees" },
      { status: 500 },
    )
  }

  const coffees: UserCoffee[] = await Promise.all(
    (data ?? []).map(async (coffee) => {
      let imageUrl: string | null = null
      if (coffee.image_path) {
        const { data: signedData } = await supabase.storage
          .from("coffee-images")
          .createSignedUrl(coffee.image_path, 60 * 60)
        imageUrl = signedData?.signedUrl ?? null
      }

      return {
        id: coffee.id,
        name: coffee.name,
        roaster: coffee.roaster,
        origin: coffee.origin,
        roastLevel: coffee.roast_level,
        processType: coffee.process_type,
        roastedDate: coffee.roasted_date,
        tasteProfile: coffee.taste_profile,
        notes: coffee.notes,
        imageUrl,
        createdAt: coffee.created_at,
      }
    })
  )

  return NextResponse.json<CoffeeListResponse>({ coffees })
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to fetch session", authError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Unable to validate session" },
      { status: 500 },
    )
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "You must be logged in" },
      { status: 401 },
    )
  }

  const formData = await request.formData()

  const nameValue = formData.get("name")
  const roasterValue = formData.get("roaster")
  const originValue = formData.get("origin")
  const roastLevelValue = formData.get("roastLevel")
  const processTypeValue = formData.get("processType")
  const roastedDateValue = formData.get("roastedDate")
  const tasteProfileValue = formData.get("tasteProfile")
  const notesValue = formData.get("notes")
  const imageValue = formData.get("image")

  let tasteProfile: string[] | undefined
  if (typeof tasteProfileValue === "string" && tasteProfileValue.trim()) {
    try {
      tasteProfile = JSON.parse(tasteProfileValue)
    } catch {
      tasteProfile = tasteProfileValue.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }

  let payload: z.infer<typeof coffeeCreateSchema>

  try {
    payload = coffeeCreateSchema.parse({
      name: typeof nameValue === "string" ? nameValue : undefined,
      roaster: typeof roasterValue === "string" ? roasterValue : undefined,
      origin: typeof originValue === "string" ? originValue : undefined,
      roastLevel: typeof roastLevelValue === "string" ? roastLevelValue : undefined,
      processType: typeof processTypeValue === "string" ? processTypeValue : undefined,
      roastedDate: typeof roastedDateValue === "string" ? roastedDateValue : undefined,
      tasteProfile,
      notes: typeof notesValue === "string" ? notesValue : undefined,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    console.error("Failed to parse coffee payload", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid request payload" },
      { status: 400 },
    )
  }

  let imagePath: string | null = null

  if (imageValue instanceof File && imageValue.size > 0) {
    const validation = validateImageFile(imageValue)
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>({ error: validation.message }, { status: 422 })
    }

    const uploadResult = await uploadCoffeeImage(supabase, user.id, imageValue)
    if (!uploadResult.success) {
      return NextResponse.json<ApiErrorResponse>(
        { error: uploadResult.message ?? "Failed to upload image" },
        { status: 500 },
      )
    }
    imagePath = uploadResult.path
  }

  const insert = {
    user_id: user.id,
    name: payload.name,
    roaster: payload.roaster ?? null,
    origin: payload.origin ?? null,
    roast_level: payload.roastLevel ?? null,
    process_type: payload.processType ?? null,
    roasted_date: payload.roastedDate ?? null,
    taste_profile: payload.tasteProfile ?? null,
    notes: payload.notes ?? null,
    image_path: imagePath,
  }

  const { data, error } = await supabase
    .from("user_coffees")
    .insert(insert)
    .select("id, name, roaster, origin, roast_level, process_type, roasted_date, taste_profile, notes, image_path, created_at")
    .single()

  if (error || !data) {
    console.error("Failed to create coffee", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to save coffee" },
      { status: 500 },
    )
  }

  let imageUrl: string | null = null
  if (data.image_path) {
    const { data: signedData } = await supabase.storage
      .from("coffee-images")
      .createSignedUrl(data.image_path, 60 * 60)
    imageUrl = signedData?.signedUrl ?? null
  }

  return NextResponse.json<CoffeeCreateResponse>(
    {
      coffee: {
        id: data.id,
        name: data.name,
        roaster: data.roaster,
        origin: data.origin,
        roastLevel: data.roast_level,
        processType: data.process_type,
        roastedDate: data.roasted_date,
        tasteProfile: data.taste_profile,
        notes: data.notes,
        imageUrl,
        createdAt: data.created_at,
      },
    },
    { status: 201 },
  )
}

function validateImageFile(file: File): { valid: true } | { valid: false; message: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { valid: false, message: "Unsupported image type. Use PNG, JPEG, or WebP." }
  }

  if (file.size > MAX_FILE_BYTES) {
    return { valid: false, message: "Image must be 5MB or smaller" }
  }

  return { valid: true }
}

async function uploadCoffeeImage(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>,
  userId: string,
  file: File,
): Promise<{ success: true; path: string } | { success: false; message?: string }> {
  const extension = extractExtension(file.name, file.type)
  const key = `${userId}/${randomUUID()}${extension ? `.${extension}` : ""}`
  const arrayBuffer = await file.arrayBuffer()

  const upload = await supabase.storage
    .from("coffee-images")
    .upload(key, arrayBuffer, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    })

  if (upload.error) {
    console.error("Failed to upload coffee image", upload.error)
    return { success: false, message: "Failed to upload image" }
  }

  return { success: true, path: key }
}

function extractExtension(filename: string | undefined, mime: string | undefined): string | null {
  if (filename && filename.includes(".")) {
    const ext = filename.split(".").pop()
    return ext ? ext.toLowerCase() : null
  }

  if (!mime) return null

  switch (mime) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    default:
      return null
  }
}
