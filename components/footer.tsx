import Link from "next/link"
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-4">This is Africa</h3>
            <p className="text-gray-300 mb-4">
              Discover the magic of Africa with our authentic tours and unforgettable experiences.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tours" className="text-gray-300 hover:text-orange-500">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-gray-300 hover:text-orange-500">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-500">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Destinations</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/destinations/south-africa" className="text-gray-300 hover:text-orange-500">
                  South Africa
                </Link>
              </li>
              <li>
                <Link href="/destinations/kenya" className="text-gray-300 hover:text-orange-500">
                  Kenya
                </Link>
              </li>
              <li>
                <Link href="/destinations/tanzania" className="text-gray-300 hover:text-orange-500">
                  Tanzania
                </Link>
              </li>
              <li>
                <Link href="/destinations/botswana" className="text-gray-300 hover:text-orange-500">
                  Botswana
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">+61 2 9555 6441</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">info@thisisafrica.com.au</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Sydney, Australia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 This is Africa. All rights reserved. |
            <Link href="/privacy" className="hover:text-orange-500 ml-1">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="/terms" className="hover:text-orange-500 ml-1">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
