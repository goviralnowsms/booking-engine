import { NextResponse } from "next/server"

export async function GET() {
  try {
    // For now, return sample tours. Later, this will fetch from TourPlan API
    const sampleTours = [
      {
        id: "tour-1",
        name: "Sydney Harbour Bridge Climb",
        description: "Experience breathtaking views of Sydney from the top of the iconic Harbour Bridge",
        duration_days: 1,
        base_price: 299,
        currency: "AUD",
        supplier_name: "BridgeClimb Sydney",
        tourplan_product_id: "SYD001",
      },
      {
        id: "tour-2",
        name: "Blue Mountains Day Tour",
        description: "Explore the stunning Blue Mountains with scenic railway and skyway experiences",
        duration_days: 1,
        base_price: 159,
        currency: "AUD",
        supplier_name: "Blue Mountains Tours",
        tourplan_product_id: "BM002",
      },
      {
        id: "tour-3",
        name: "Great Ocean Road 3-Day Adventure",
        description: "Journey along Australia's most scenic coastal drive with accommodation included",
        duration_days: 3,
        base_price: 899,
        currency: "AUD",
        supplier_name: "Coastal Adventures",
        tourplan_product_id: "GOR003",
      },
      {
        id: "tour-4",
        name: "Uluru Sunrise & Cultural Experience",
        description: "Witness the magical sunrise at Uluru and learn about Aboriginal culture",
        duration_days: 2,
        base_price: 649,
        currency: "AUD",
        supplier_name: "Outback Experiences",
        tourplan_product_id: "ULU004",
      },
    ]

    return NextResponse.json({
      success: true,
      tours: sampleTours,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch tours",
      },
      { status: 500 },
    )
  }
}
