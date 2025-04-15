export default function ServiceAreaLegend() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-6">
      <h3 className="font-semibold text-[#002147] mb-2">Service Area Information</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#002147] opacity-30 border border-[#002147] mr-2"></div>
          <span>Free travel within 20-mile radius of ZIP 77591</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#A52A2A] opacity-30 border border-[#A52A2A] mr-2"></div>
          <span>Extended service area (20-30 miles) with $0.50/mile fee</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-5 bg-[#002147] mr-2 flex items-center justify-center text-white text-xs">P</div>
          <span>Our base location (ZIP 77591)</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3">
        Service beyond 30 miles may be available for an additional fee. Please contact us for details.
      </p>
    </div>
  )
}
