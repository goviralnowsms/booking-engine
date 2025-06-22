import { getTourplanAPI } from "@/lib/tourplan-api"

export async function POST(request: Request) {
  try {
    const searchParams = await request.json()
    const { country, destination, tourLevel, startDate, endDate, adults, children } = searchParams

    const tourplanAPI = getTourplanAPI()
    const tourplanTours = await tourplanAPI.searchTours({
      country,
      destination,
      tourLevel,
      startDate,
      endDate,
    })

    // Convert Tourplan format to our Tour format
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

    // Sort tours by availability and price
    const sortedTours = tours.sort((a, b) => {
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
