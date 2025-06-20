import type { Tour } from "@/app/page"

export async function POST(request: Request) {
  try {
    const searchParams = await request.json()
    const { country, destination, tourLevel, startDate, endDate, adults, children } = searchParams

    // For now, return mock data since Tourplan API isn't configured yet
    const mockTours: Tour[] = [
      {
        id: "tour-001",
        name: "Kruger National Park Safari",
        description:
          "Experience the Big Five in South Africa's premier game reserve. This 3-day safari includes game drives, accommodation, and all meals.",
        duration: 3,
        price: 1200,
        level: "standard",
        availability: "OK",
        supplier: "African Safari Co",
        location: "Kruger National Park, South Africa",
        extras: [
          {
            id: "extra-001",
            name: "Bush Walk",
            description: "Guided walking safari with experienced ranger",
            price: 150,
            isCompulsory: false,
          },
          {
            id: "extra-002",
            name: "Park Fees",
            description: "Conservation fees (required)",
            price: 50,
            isCompulsory: true,
          },
        ],
      },
      {
        id: "tour-002",
        name: "Serengeti Migration Experience",
        description: "Witness the Great Migration in Tanzania's Serengeti. 5-day luxury safari with premium lodges.",
        duration: 5,
        price: 2800,
        level: "luxury",
        availability: "OK",
        supplier: "Tanzania Adventures",
        location: "Serengeti, Tanzania",
        extras: [
          {
            id: "extra-003",
            name: "Hot Air Balloon",
            description: "Sunrise balloon safari over the Serengeti",
            price: 450,
            isCompulsory: false,
          },
        ],
      },
      {
        id: "tour-003",
        name: "Gorilla Trekking Rwanda",
        description:
          "Once-in-a-lifetime mountain gorilla encounter in Volcanoes National Park. Includes permits and accommodation.",
        duration: 2,
        price: 1800,
        level: "standard",
        availability: "RQ",
        supplier: "Rwanda Eco Tours",
        location: "Volcanoes National Park, Rwanda",
        extras: [
          {
            id: "extra-004",
            name: "Gorilla Permit",
            description: "Required permit for gorilla trekking",
            price: 700,
            isCompulsory: true,
          },
        ],
      },
      {
        id: "tour-004",
        name: "Cape Town & Wine Country",
        description: "Explore Cape Town's highlights and visit world-famous wine regions. Cultural and scenic tour.",
        duration: 4,
        price: 950,
        level: "basic",
        availability: "OK",
        supplier: "Cape Adventures",
        location: "Cape Town, South Africa",
        extras: [
          {
            id: "extra-005",
            name: "Wine Tasting",
            description: "Premium wine tasting experience",
            price: 80,
            isCompulsory: false,
          },
        ],
      },
      {
        id: "tour-005",
        name: "Okavango Delta Mokoro Safari",
        description: "Traditional dugout canoe safari through the pristine Okavango Delta wetlands.",
        duration: 3,
        price: 1400,
        level: "standard",
        availability: "OK",
        supplier: "Botswana Wilderness",
        location: "Okavango Delta, Botswana",
        extras: [],
      },
    ]

    // Filter tours based on search criteria
    let filteredTours = mockTours

    if (country) {
      filteredTours = filteredTours.filter((tour) => tour.location.toLowerCase().includes(country.toLowerCase()))
    }

    if (destination) {
      filteredTours = filteredTours.filter((tour) => tour.location.toLowerCase().includes(destination.toLowerCase()))
    }

    if (tourLevel) {
      filteredTours = filteredTours.filter((tour) => tour.level === tourLevel)
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
      source: "mock-data",
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
