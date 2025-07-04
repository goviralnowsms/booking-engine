import Link from "next/link"
import Image from "next/image"
import { Car, Building, Ship, Train, Users, Package } from "lucide-react"

const categories = [
  {
    title: "GROUP TOURS",
    description: "Specially selected tours. Great group accommodation and transport. Ideal for solo travellers.",
    icon: Users,
    href: "/group-tours",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jpg-jS9rWqNokQHraE0UZ4VKn5VtPcYgQ2.jpeg",
  },
  {
    title: "ACCOMMODATION",
    description: "Great group tours. Choose from a variety of hotels. Ideal for solo travellers.",
    icon: Building,
    href: "/accommodation",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.jpg-MiICinKLvDhYScJDvi23I9XbW8UaQt.jpeg",
  },
  {
    title: "RAIL TOURS",
    description: "Discover our rail tours. The Blue Train, Shongololo Express and more.",
    icon: Train,
    href: "/rail-tours",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-Cz0na1LbpeZEXESmw6YTKIaAThiIcY.jpeg",
  },
  {
    title: "PACKAGES",
    description: "Specially selected tours. Great group accommodation and transport. Ideal for solo travellers.",
    icon: Package,
    href: "/packages",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.jpg-1MdxFlowVepMNZ7jCK8Fy7U7xI0Riu.jpeg",
  },
  {
    title: "CRUISES",
    description: "Discover our cruise options. Zambezi River cruises and more.",
    icon: Ship,
    href: "/cruises",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.jpg-J3KOYmAWg9ER6wEphiEqzpzmzBUjCV.jpeg",
  },
  {
    title: "TAILOR MADE",
    description: "Custom-designed adventures. Personalized itineraries for your perfect African journey.",
    icon: Car,
    href: "/tailor-made",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tailor-made.jpg-qnQVfvKfB472tRUXsX2DTkeXn59dvh.jpeg",
  },
]

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map((category) => {
        const IconComponent = category.icon
        return (
          <Link key={category.title} href={category.href} className="group">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all" />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="bg-orange-500 p-2 rounded-full mr-3">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{category.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
