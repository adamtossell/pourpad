import type { DailyBrewSummary, SavedRecipeSummary } from "@/lib/types/dashboard"

export function getMockDailyBrews(): DailyBrewSummary[] {
  const pourSets = [
    [
      { id: "pour-1", order: 0, startTimeSeconds: 0, endTimeSeconds: 30, waterGrams: 60 },
      { id: "pour-2", order: 1, startTimeSeconds: 30, endTimeSeconds: 90, waterGrams: 120 },
      { id: "pour-3", order: 2, startTimeSeconds: 120, endTimeSeconds: 180, waterGrams: 100 },
    ],
    [
      { id: "pour-4", order: 0, startTimeSeconds: 0, endTimeSeconds: 40, waterGrams: 50 },
      { id: "pour-5", order: 1, startTimeSeconds: 45, endTimeSeconds: 110, waterGrams: 120 },
      { id: "pour-6", order: 2, startTimeSeconds: 120, endTimeSeconds: 210, waterGrams: 130 },
    ],
  ]

  const base: Omit<DailyBrewSummary, "id">[] = [
    {
      title: "Citrus bloom V60",
      createdAt: new Date().toISOString(),
      description: "Bright, tea-like cup with orange zest acidity and a honey finish.",
      brewerType: "V60",
      metadata: {
        brewerType: "V60",
        description: "Bright, floral, and delicate with a lingering sweetness.",
        coffeeWeight: 20,
        grindSize: "28 • EK43",
        waterTemp: 94,
        totalBrewTimeSeconds: 210,
      },
      pours: pourSets[0],
    },
    {
      title: "Chocolate fudge Kalita",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      description: "Syrupy bodied brew with cocoa and toasted almond notes.",
      brewerType: "Kalita",
      metadata: {
        brewerType: "Kalita",
        description: "Comforting and sweet with mellow acidity.",
        coffeeWeight: 24,
        grindSize: "7 • Comandante",
        waterTemp: 92,
        totalBrewTimeSeconds: 240,
      },
      pours: pourSets[1],
    },
  ]

  return base.map((brew, index) => ({ id: `daily-${index}`, ...brew }))
}

export function getMockSavedBrews(): SavedRecipeSummary[] {
  return [
    {
      id: "saved-1",
      title: "Bloom & pulse flat bottom",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      description: "Layered caramel sweetness with plum acidity.",
      brewerType: "Kalita",
      author: {
        id: "author-1",
        displayName: "Avery Harper",
      },
      metadata: {
        brewerType: "Kalita",
        description: "Layered sweetness and rich texture.",
        coffeeWeight: 22,
        grindSize: "26 • EK43",
        waterTemp: 94,
        totalBrewTimeSeconds: 230,
      },
      pours: [
        { id: "saved-1-pour-1", order: 0, startTimeSeconds: 0, endTimeSeconds: 35, waterGrams: 60 },
        { id: "saved-1-pour-2", order: 1, startTimeSeconds: 45, endTimeSeconds: 120, waterGrams: 120 },
        { id: "saved-1-pour-3", order: 2, startTimeSeconds: 130, endTimeSeconds: 210, waterGrams: 110 },
      ],
    },
    {
      id: "saved-2",
      title: "Longer bloom Origami",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      description: "Juicy raspberry with a silky finish and lavender aroma.",
      brewerType: "Origami",
      author: {
        id: "author-2",
        displayName: "Noah Reyes",
      },
      metadata: {
        brewerType: "Origami",
        description: "Refined, aromatic, and vibrant.",
        coffeeWeight: 18,
        grindSize: "5 • Kinu",
        waterTemp: 93,
        totalBrewTimeSeconds: 205,
      },
      pours: [
        { id: "saved-2-pour-1", order: 0, startTimeSeconds: 0, endTimeSeconds: 45, waterGrams: 55 },
        { id: "saved-2-pour-2", order: 1, startTimeSeconds: 60, endTimeSeconds: 120, waterGrams: 110 },
        { id: "saved-2-pour-3", order: 2, startTimeSeconds: 135, endTimeSeconds: 195, waterGrams: 90 },
      ],
    },
  ]
}
