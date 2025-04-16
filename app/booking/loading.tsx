export default function BookingLoading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[500px] p-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-[#91A3B0]/30 border-t-[#A52A2A] animate-spin"></div>
      </div>
      <p className="mt-4 text-[#002147] font-medium">Preparing your booking form...</p>
      <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
        We're loading your booking options. This should only take a moment.
      </p>
    </div>
  )
}
