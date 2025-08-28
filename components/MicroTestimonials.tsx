export default function MicroTestimonials() {
  const quotes = [
    { name: 'Angela M.', text: 'They notarized bedside at Methodist Clear Lake within an hour. Lifesaver.' },
    { name: 'Robert C.', text: 'On time, transparent price, super professional. Will use again.' },
    { name: 'Tina H.', text: 'Booked online and they came to our office in Webster the same day.' }
  ]
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-6 grid gap-4 md:grid-cols-3">
        {quotes.map((q, i) => (
          <div key={i} className="rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-gray-800">“{q.text}”</p>
            <p className="mt-2 text-xs text-gray-500">{q.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}





