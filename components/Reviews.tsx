export default function Reviews() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        {[
          { q: "On time, super professional.", a: "— J.M." },
          { q: "Booked at lunch, done by dinner.", a: "— A.R." },
          { q: "Made loan docs painless.", a: "— K.S." },
        ].map((r) => (
          <div key={r.q} className="rounded-2xl p-6 border border-black/5">
            <p className="text-lg">“{r.q}”</p>
            <p className="text-black/60 mt-2">{r.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


