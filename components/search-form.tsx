"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Search } from "lucide-react"

export function SearchForm() {
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("2")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Search:", { destination, checkIn, checkOut, guests })
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-orange-500" />
            Destination
          </label>
          <input
            type="text"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-orange-500" />
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-orange-500" />
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Users className="w-4 h-4 mr-1 text-orange-500" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5+">5+ Guests</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold">
        <Search className="w-5 h-5 mr-2" />
        Search Tours
      </Button>
    </form>
  )
}
