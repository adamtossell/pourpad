"use client"

import useSWR from "swr"

import type { CoffeeListResponse, CoffeeCreateResponse } from "@/lib/types/coffees"
import type { CoffeeCreateFormValues } from "@/lib/validators/coffee"

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function useCoffees() {
  const { data, error, mutate, isLoading } = useSWR<CoffeeListResponse>("/api/coffees", fetcher)

  return {
    coffees: data?.coffees ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate,
  }
}

export async function createCoffee(payload: CoffeeCreateFormValues, image?: File | null) {
  const formData = new FormData()
  formData.append("name", payload.name)

  if (payload.roaster) {
    formData.append("roaster", payload.roaster)
  }
  if (payload.origin) {
    formData.append("origin", payload.origin)
  }
  if (payload.roastLevel) {
    formData.append("roastLevel", payload.roastLevel)
  }
  if (payload.processType) {
    formData.append("processType", payload.processType)
  }
  if (payload.roastedDate) {
    formData.append("roastedDate", payload.roastedDate)
  }
  if (payload.tasteProfile && payload.tasteProfile.length > 0) {
    formData.append("tasteProfile", JSON.stringify(payload.tasteProfile))
  }
  if (payload.notes) {
    formData.append("notes", payload.notes)
  }
  if (image) {
    formData.append("image", image)
  }

  const response = await fetch("/api/coffees", {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error ?? "Failed to save coffee")
  }

  const data: CoffeeCreateResponse = await response.json()
  return data.coffee
}
