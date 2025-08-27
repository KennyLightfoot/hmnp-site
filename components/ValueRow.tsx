export default function ValueRow() {
  return (
    <section className="bg-accent/10">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-secondary mb-1">We come to you</h3>
          <p className="text-sm text-secondary/70">Home, office, hospital, anywhere.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-secondary mb-1">Book in 60 seconds</h3>
          <p className="text-sm text-secondary/70">Instant estimate and earliest arrival.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-secondary mb-1">Transparent pricing</h3>
          <p className="text-sm text-secondary/70">Texas‑compliant fees, no surprises.</p>
        </div>
      </div>
    </section>
  )
}


