export default function FaqStrip() {
  return (
    <section className="bg-[#F7F7F5]">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-6 text-sm">
        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <p className="font-medium mb-1">What ID do I need?</p>
          <p className="text-black/70">Government-issued photo ID (unexpired or within allowed grace).</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <p className="font-medium mb-1">How fast can you arrive?</p>
          <p className="text-black/70">Often same-day; booking shows earliest window by ZIP.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-black/5">
          <p className="font-medium mb-1">What will it cost?</p>
          <p className="text-black/70">In-person: $10/act + travel; Online (RON): $25/act.</p>
        </div>
      </div>
    </section>
  )
}


