"use client"

import useSWR from "swr"

import type { CoffeeFilterListResponse, CoffeeFilterCreateResponse } from "@/lib/types/coffee-filters"
import type { CoffeeFilterCreateFormValues } from "@/lib/validators/coffee-filter"

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function useCoffeeFilters() {
  const { data, error, mutate, isLoading } = useSWR<CoffeeFilterListResponse>("/api/coffee-filters", fetcher)

  return {
    coffeeFilters: data?.coffeeFilters ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate,
  }
}

export async function createCoffeeFilter(payload: CoffeeFilterCreateFormValues) {
  const response = await fetch("/api/coffee-filters", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error ?? "Failed to save coffee filter")
  }

  const data: CoffeeFilterCreateResponse = await response.json()
  return data.coffeeFilter
}
