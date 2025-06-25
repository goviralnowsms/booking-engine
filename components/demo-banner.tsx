import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-orange-600" />
        <div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 mr-3">
            LIVE DEMO
          </Badge>
          <span className="text-orange-900 font-medium">
            Interactive demonstration of the This is Africa booking engine
          </span>
          <p className="text-sm text-orange-700 mt-1">
            Experience the complete booking flow with sample African tours and realistic data
          </p>
        </div>
      </div>
    </div>
  )
}
