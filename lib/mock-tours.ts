import type { Tour } from "@/app/page"

export const mockTours: Tour[] = [
  {
    id: "tour-001",
    name: "Ultimate Kruger Safari Experience",
    description:
      "Embark on an unforgettable 5-day Big Five safari adventure in South Africa's premier game reserve. Stay in luxury lodges, enjoy guided game drives at dawn and dusk, and witness the incredible wildlife of the African bushveld. This comprehensive safari includes all meals, accommodation, and professional guide services.",
    duration: 5,
    price: 2400,
    level: "luxury",
    availability: "OK",
    supplier: "African Safari Specialists",
    location: "Kruger National Park, South Africa",
    extras: [
      {
        id: "extra-001",
        name: "Bush Walk with Ranger",
        description: "Guided walking safari with experienced armed ranger - get up close with nature",
        price: 180,
        isCompulsory: false,
      },
      {
        id: "extra-002",
        name: "Conservation Fees",
        description: "Park entrance and conservation fees (required for all visitors)",
        price: 75,
        isCompulsory: true,
      },
      {
        id: "extra-003",
        name: "Sunset Game Drive",
        description: "Extended evening game drive with sundowner drinks in the bush",
        price: 120,
        isCompulsory: false,
      },
      {
        id: "extra-004",
        name: "Photography Workshop",
        description: "Professional wildlife photography guidance and tips",
        price: 200,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "tour-002",
    name: "Serengeti Great Migration Spectacular",
    description:
      "Witness one of nature's most incredible phenomena - the Great Migration. This 7-day luxury safari follows the massive herds of wildebeest and zebra across the Serengeti plains. Stay in premium tented camps, enjoy hot air balloon rides, and experience the raw beauty of Tanzania's most famous national park.",
    duration: 7,
    price: 4200,
    level: "luxury",
    availability: "OK",
    supplier: "Tanzania Premium Safaris",
    location: "Serengeti National Park, Tanzania",
    extras: [
      {
        id: "extra-005",
        name: "Hot Air Balloon Safari",
        description: "Sunrise balloon flight over the Serengeti with champagne breakfast",
        price: 550,
        isCompulsory: false,
      },
      {
        id: "extra-006",
        name: "Park Fees & Permits",
        description: "All national park fees and camping permits (required)",
        price: 200,
        isCompulsory: true,
      },
      {
        id: "extra-007",
        name: "Cultural Village Visit",
        description: "Visit authentic Maasai village and learn about traditional culture",
        price: 85,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "tour-003",
    name: "Mountain Gorilla Trekking Adventure",
    description:
      "Experience the ultimate wildlife encounter with endangered mountain gorillas in Rwanda's Volcanoes National Park. This 3-day adventure includes gorilla permits, luxury accommodation, and expert guides. Limited to 8 people per day - this is truly a once-in-a-lifetime experience.",
    duration: 3,
    price: 2800,
    level: "standard",
    availability: "RQ",
    supplier: "Rwanda Eco Adventures",
    location: "Volcanoes National Park, Rwanda",
    extras: [
      {
        id: "extra-008",
        name: "Gorilla Trekking Permit",
        description: "Official permit for gorilla trekking (required - limited availability)",
        price: 1500,
        isCompulsory: true,
      },
      {
        id: "extra-009",
        name: "Porter Service",
        description: "Local porter to carry your backpack during the trek",
        price: 25,
        isCompulsory: false,
      },
      {
        id: "extra-010",
        name: "Golden Monkey Tracking",
        description: "Additional primate experience tracking golden monkeys",
        price: 100,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "tour-004",
    name: "Cape Town & Winelands Discovery",
    description:
      "Explore the stunning Mother City and world-renowned wine regions. This 6-day tour includes Table Mountain, Cape Point, Robben Island, and visits to premium wine estates in Stellenbosch and Franschhoek. Perfect blend of culture, history, and culinary experiences.",
    duration: 6,
    price: 1800,
    level: "standard",
    availability: "OK",
    supplier: "Cape Town Tours & Wine",
    location: "Cape Town & Winelands, South Africa",
    extras: [
      {
        id: "extra-011",
        name: "Premium Wine Tastings",
        description: "Exclusive tastings at 5-star wine estates with cellar tours",
        price: 150,
        isCompulsory: false,
      },
      {
        id: "extra-012",
        name: "Table Mountain Cable Car",
        description: "Round-trip cable car tickets to Table Mountain summit",
        price: 35,
        isCompulsory: false,
      },
      {
        id: "extra-013",
        name: "Helicopter Scenic Flight",
        description: "15-minute helicopter tour over Cape Peninsula",
        price: 280,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "tour-005",
    name: "Okavango Delta Mokoro Safari",
    description:
      "Navigate the pristine waterways of the Okavango Delta in traditional dugout canoes (mokoros). This 4-day adventure includes island camping, walking safaris, and incredible bird watching. Experience Botswana's UNESCO World Heritage site in its most authentic form.",
    duration: 4,
    price: 1600,
    level: "basic",
    availability: "OK",
    supplier: "Botswana Wilderness Expeditions",
    location: "Okavango Delta, Botswana",
    extras: [
      {
        id: "extra-014",
        name: "Scenic Flight",
        description: "30-minute scenic flight over the Delta for aerial photography",
        price: 320,
        isCompulsory: false,
      },
      {
        id: "extra-015",
        name: "Fishing Experience",
        description: "Traditional fishing with local guides in the Delta channels",
        price: 60,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "tour-006",
    name: "Victoria Falls Adventure Package",
    description:
      "Experience the thundering Victoria Falls from both Zambia and Zimbabwe sides. This 4-day adrenaline-packed adventure includes white water rafting, bungee jumping, helicopter flights, and sunset cruises on the Zambezi River.",
    duration: 4,
    price: 1400,
    level: "standard",
    availability: "OK",
    supplier: "Victoria Falls Adventures",
    location: "Victoria Falls, Zambia/Zimbabwe",
    extras: [
      {
        id: "extra-016",
        name: "Bungee Jump",
        description: "111-meter bungee jump from Victoria Falls Bridge",
        price: 160,
        isCompulsory: false,
      },
      {
        id: "extra-017",
        name: "White Water Rafting",
        description: "Full day Grade 5 white water rafting on Zambezi River",
        price: 140,
        isCompulsory: false,
      },
      {
        id: "extra-018",
        name: "Helicopter Flight",
        description: "15-minute 'Flight of Angels' helicopter tour over the Falls",
        price: 180,
        isCompulsory: false,
      },
    ],
  },
]

export function getMockTours(searchCriteria?: any): Tour[] {
  // Return all tours for demo, but you could filter based on criteria
  return mockTours
}
