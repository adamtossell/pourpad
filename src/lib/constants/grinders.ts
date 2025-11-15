import type { GrinderScaleType } from "@/lib/types/grinders"

export const GRINDER_SCALE_META: Record<GrinderScaleType, {
  label: string
  summary: string
  description: string
}> = {
  text: {
    label: "Freeform text",
    summary: "Use words like 'espresso' or 'medium', no numbers required.",
    description:
      "Ideal when you track grind notes with descriptors or sentences instead of numeric measurements.",
  },
  numeric: {
    label: "Number scale",
    summary: "Use when your grinder has a numeric dial (0-99, decimals, etc.).",
    description:
      "Great for grinders with dials or screens where you record exact numeric settings, including decimals.",
  },
  stepped: {
    label: "Stepped clicks",
    summary: "Use when you count physical detents or clicks from a zero point.",
    description:
      "Best for grinders where you count the number of detents or clicks from a reference point (e.g., 24 clicks).",
  },
}

export const formatScaleTypeLabel = (scaleType: GrinderScaleType) =>
  GRINDER_SCALE_META[scaleType]?.label ?? scaleType
