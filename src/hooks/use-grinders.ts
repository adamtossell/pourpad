"use client"

import useSWR from "swr"

import type {
  GrinderListResponse,
  GrinderCreatePayload,
  GrinderCreateResponse,
  DefaultGrinderListResponse,
} from "@/lib/types/grinders"

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function useGrinders() {
  const { data, error, mutate, isLoading } = useSWR<GrinderListResponse>('/api/grinders', fetcher)

  return {
    grinders: data?.grinders ?? [],
    recentGrinds: data?.recentGrinds ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate,
  }
}

export function useDefaultGrinders() {
  const { data, error, isLoading, mutate } = useSWR<DefaultGrinderListResponse>('/api/grinders/defaults', fetcher)

  return {
    defaultGrinders: data?.grinders ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate,
  }
}

export async function createGrinder(payload: GrinderCreatePayload) {
  const response = await fetch('/api/grinders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.error ?? 'Failed to save grinder')
  }

  const data: GrinderCreateResponse = await response.json()
  return data.grinder
}
