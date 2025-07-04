"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"
import type { Tour } from "@/app/page"

interface FeaturedToursProps {
  onTourSelect: (tour: Tour) => void
}

const featuredTours: Tour[] = [
  {
    id: "safari-kruger",
    name: "Kruger National Park Safari",
    description:
      "Experience the Big Five in South Africa's premier game reserve. This 3-day safari includes game drives, luxury accommodation, and expert guides.",
    duration: 3,
    price: 1250,
    level: "standard",
    availability: "OK",
    supplier: "African Safari Co",
    location: "South Africa",
    extras: [
      { id: "meals", name: "All Meals", description: "Breakfast, lunch and dinner", price: 150, isCompulsory: true },
      { id: "transfers", name: "Airport Transfers", description: "Return transfers", price: 80, isCompulsory: false },
    ],
  },
  {
    id: "serengeti-migration",
    name: "Great Migration Safari",
    description:
      "Witness the spectacular wildebeest migration in Tanzania's Serengeti. 5-day adventure with camping and lodge options.",
    duration: 5,
    price: 2100,
    level: "luxury",
    availability: "OK",
    supplier: "Tanzania Adventures",
    location: "Tanzania",
    extras: [
      {
        id: "balloon",
        name: "Hot Air Balloon",
        description: "Sunrise balloon safari",
        price: 450,
        isCompulsory: false,
      },
      {
        id: "cultural",
        name: "Maasai Village Visit",
        description: "Cultural experience",
        price: 75,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "cape-town-wine",
    name: "Cape Town & Winelands",
    description:
      "Explore Cape Town's highlights and the famous wine regions. Includes Table Mountain, wine tastings, and coastal drives.",
    duration: 4,
    price: 950,
    level: "standard",
    availability: "OK",
    supplier: "Cape Tours",
    location: "South Africa",
    extras: [
      {
        id: "wine-tasting",
        name: "Premium Wine Tasting",
        description: "Visit 3 premium wineries",
        price: 120,
        isCompulsory: false,
      },
      {
        id: "helicopter",
        name: "Helicopter Tour",
        description: "Scenic helicopter flight",
        price: 280,
        isCompulsory: false,
      },
    ],
  },
  {
    id: "victoria-falls",
    name: "Victoria Falls Adventure",
    description:
      "Experience the mighty Victoria Falls from both Zimbabwe and Zambia sides. Includes adventure activities and sunset cruise.",
    duration: 2,
    price: 680,
    level: "basic",
    availability: "OK",
    supplier: "Falls Adventures",
    location: "Zimbabwe",
    extras: [
      {
        id: "bungee",
        name: "Bungee Jump",
        description: "Victoria Falls bridge bungee",
        price: 160,
        isCompulsory: false,
      },
      {
        id: "helicopter-falls",
        name: "Helicopter Flight",
        description: "Flight of Angels",
        price: 180,
        isCompulsory: false,
      },
    ],
  },
]

export function FeaturedTours({ onTourSelect }: FeaturedToursProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-blue-100 text-blue-800"
      case "standard":
        return "bg-green-100 text-green-800"
      case "luxury":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured African Tours</h2>
        <p className="text-lg text-gray-600">Handpicked experiences showcasing the best of Africa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {featuredTours.map((tour) => (
          <Card key={tour.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl">{tour.name}</CardTitle>
                <Badge className={getLevelColor(tour.level)} variant="secondary">
                  {tour.level}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tour.location}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {tour.duration} days
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700 mb-4">{tour.description}</CardDescription>

              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${tour.price}
                  <span className="text-sm font-normal text-gray-500"> per person</span>
                </div>
                <Button onClick={() => onTourSelect(tour)} className="bg-orange-500 hover:bg-orange-600">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
