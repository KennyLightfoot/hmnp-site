export default function PolicyStrip() {
  return (
    <section className="bg-gray-50 py-6">
      <div className="container mx-auto px-4 text-sm text-gray-700">
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div>
            <strong>On‑time credit:</strong> If we miss the confirmed arrival window by &gt;15 minutes, we waive the rush fee or credit $25.
          </div>
          <div>
            <strong>RON re‑do:</strong> If a session fails due to platform/system error, we re‑do it free. KBA/ID failures may incur fees.
          </div>
          <div>
            <strong>Refunds:</strong> Full with ≥4 hours’ notice. Late cancel/no‑show: $50 fee.
          </div>
        </div>
      </div>
    </section>
  )
}



