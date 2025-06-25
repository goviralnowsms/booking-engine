import { getMockTours } from "@/lib/mock-tours"

export async function POST(request: Request) {
  try {
    const searchParams = await request.json()
    console.log("Search params:", searchParams)

    // Simulate API delay for realistic experience
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const tours = getMockTours(searchParams)

    // Filter tours based on search criteria for demo
    let filteredTours = tours

    if (searchParams.country) {
      filteredTours = filteredTours.filter((tour) =>
        tour.location.toLowerCase().includes(searchParams.country.toLowerCase()),
      )
    }

    if (searchParams.destination) {
      filteredTours = filteredTours.filter((tour) =>
        tour.location.toLowerCase().includes(searchParams.destination.toLowerCase()),
      )
    }

    if (searchParams.tourLevel) {
      filteredTours = filteredTours.filter((tour) => tour.level === searchParams.tourLevel)
    }

    if (searchParams.tourType) {
      // Simple mapping of tour types to tours for demo
      const typeMapping: Record<string, string[]> = {
        safari: ["kruger", "serengeti", "okavango"],
        cultural: ["cape town", "village"],
        adventure: ["victoria falls", "gorilla", "helicopter"],
        luxury: ["serengeti", "kruger"],
        family: ["cape town", "victoria falls"],
      }

      const relevantKeywords = typeMapping[searchParams.tourType] || []
      if (relevantKeywords.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
          relevantKeywords.some((keyword) => tour.name.toLowerCase().includes(keyword)),
        )
      }
    }

    // Sort tours by availability and price
    const sortedTours = filteredTours.sort((a, b) => {
      const availabilityOrder = { OK: 0, RQ: 1, NO: 2 }
      const availabilityDiff = availabilityOrder[a.availability] - availabilityOrder[b.availability]
      if (availabilityDiff !== 0) return availabilityDiff
      return a.price - b.price
    })

    return Response.json({
      tours: sortedTours,
      cached: false,
      timestamp: new Date().toISOString(),
      source: "demo-data",
      searchCriteria: searchParams,
      totalFound: sortedTours.length,
    })
  } catch (error) {
    console.error("Tour search failed:", error)
    return Response.json(
      {
        error: "Failed to search tours",
        details: error instanceof Error ? error.message : "Unknown error",
        tours: [],
      },
      { status: 500 },
    )
  }
}
