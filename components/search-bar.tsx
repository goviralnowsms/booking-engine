"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookingIntegration } from "@/lib/booking-integration"

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void
  className?: string
  category?: string // To identify which page the search is from
  redirectToBooking?: boolean // Whether to redirect to booking engine
}

interface SearchParams {
  startingCountry: string
  destination: string
  class: string
  category?: string
}

export default function SearchBar({
  onSearch,
  className = "",
  category = "general",
  redirectToBooking = true,
}: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startingCountry: "",
    destination: "",
    class: "",
    category: category,
  })

  const handleSearch = () => {
    const searchData = {
      ...searchParams,
      category: category,
    }

    if (redirectToBooking) {
      // Redirect to booking engine with search parameters
      BookingIntegration.handleSearchSubmission(searchData, category)
    } else if (onSearch) {
      // Handle search locally (for preview/results on same page)
      onSearch(searchData)
    }
  }

  return (
    <div className={`flex flex-col md:flex-row gap-0 ${className}`}>
      <div className="bg-orange-500 text-white px-4 font-semibold h-12 flex items-center justify-center text-sm">
        Starting country
      </div>
      <Select
        value={searchParams.startingCountry}
        onValueChange={(value) => setSearchParams((prev) => ({ ...prev, startingCountry: value }))}
      >
        <SelectTrigger className="bg-white border-0 rounded-none px-4 min-w-[200px] h-12 text-sm">
          <SelectValue placeholder="Botswana" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="botswana">Botswana</SelectItem>
          <SelectItem value="south-africa">South Africa</SelectItem>
          <SelectItem value="namibia">Namibia</SelectItem>
          <SelectItem value="zimbabwe">Zimbabwe</SelectItem>
          <SelectItem value="kenya">Kenya</SelectItem>
          <SelectItem value="tanzania">Tanzania</SelectItem>
        </SelectContent>
      </Select>

      <div className="bg-orange-500 text-white px-4 font-semibold h-12 flex items-center justify-center text-sm">
        Starting destination
      </div>
      <Select
        value={searchParams.destination}
        onValueChange={(value) => setSearchParams((prev) => ({ ...prev, destination: value }))}
      >
        <SelectTrigger className="bg-white border-0 rounded-none px-4 min-w-[200px] h-12 text-sm">
          <SelectValue placeholder="(Select option)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="chobe">Chobe</SelectItem>
          <SelectItem value="okavango">Okavango Delta</SelectItem>
          <SelectItem value="kalahari">Kalahari</SelectItem>
          <SelectItem value="serengeti">Serengeti</SelectItem>
          <SelectItem value="masai-mara">Masai Mara</SelectItem>
        </SelectContent>
      </Select>

      <div className="bg-orange-500 text-white px-4 font-semibold h-12 flex items-center justify-center text-sm">
        Class
      </div>
      <Select
        value={searchParams.class}
        onValueChange={(value) => setSearchParams((prev) => ({ ...prev, class: value }))}
      >
        <SelectTrigger className="bg-white border-0 rounded-none px-4 min-w-[200px] h-12 text-sm">
          <SelectValue placeholder="(Select option)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="luxury">Luxury</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="budget">Budget</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleSearch}
        className="bg-orange-500 hover:bg-orange-600 text-white px-8 rounded-none font-semibold h-12 flex items-center justify-center text-sm"
      >
        Search
      </Button>
    </div>
  )
}
