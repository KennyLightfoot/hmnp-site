export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px] p-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-[#91A3B0]/30 border-t-[#002147] animate-spin"></div>
      </div>
      <p className="mt-4 text-[#002147] font-medium">Loading...</p>
    </div>
  )
}
