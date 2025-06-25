import { getTourplanAPI } from "@/lib/tourplan-api"

export async function POST(request: Request) {
  try {
    const searchParams = await request.json()
    console.log("Search params:", searchParams)

    const tourplanAPI = getTourplanAPI()
    
    // Convert search parameters to Tourplan format
    const tourplanParams = {
      country: searchParams.country,
      destination: searchParams.destination,
      tourLevel: searchParams.tourLevel,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      adults: searchParams.adults,
      children: searchParams.children,
      childrenAges: searchParams.childrenAges,
    }

    const tourplanTours = await tourplanAPI.searchTours(tourplanParams)

    // Convert Tourplan tours to our frontend format
    const tours = tourplanTours.map((tour) => ({
      id: tour.tourId,
      name: tour.tourName,
      description: tour.description,
      duration: tour.duration,
      price: tour.priceFrom,
      level: tour.tourLevel,
      availability: tour.availability,
      supplier: tour.supplierName,
      location: `${tour.destination}, ${tour.country}`,
      extras: tour.extras.map((extra) => ({
        id: extra.extraId,
        name: extra.extraName,
        description: extra.description,
        price: extra.price,
        isCompulsory: extra.isCompulsory,
      })),
    }))

    // Apply additional filtering for tour type if specified
    let filteredTours = tours
    if (searchParams.tourType) {
      const typeMapping: Record<string, string[]> = {
        safari: ["kruger", "serengeti", "okavango", "safari"],
        cultural: ["cape town", "village", "cultural"],
        adventure: ["victoria falls", "gorilla", "helicopter", "adventure"],
        luxury: ["luxury", "premium"],
        family: ["family", "cape town", "victoria falls"],
      }

      const relevantKeywords = typeMapping[searchParams.tourType] || []
      if (relevantKeywords.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
          relevantKeywords.some((keyword) =>
            tour.name.toLowerCase().includes(keyword) ||
            tour.description.toLowerCase().includes(keyword)
          ),
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
      source: "tourplan-api",
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
