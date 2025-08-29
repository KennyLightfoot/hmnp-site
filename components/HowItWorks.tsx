import { FileText, ConciergeBell, CheckCircle } from 'lucide-react'

export default function HowItWorks() {
  return (
    <section className="bg-paper">
      <div className="container mx-auto px-4 py-14">
        <h2 className="text-2xl font-semibold text-secondary mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl border border-black/10 p-6">
            <FileText className="mx-auto h-6 w-6 text-secondary mb-3" />
            <div className="font-medium text-secondary mb-1">Request</div>
            <p className="text-sm text-secondary/70">Tell us the docs, signers, and ZIP. Takes under a minute.</p>
          </div>
          <div className="bg-white rounded-xl border border-black/10 p-6">
            <ConciergeBell className="mx-auto h-6 w-6 text-secondary mb-3" />
            <div className="font-medium text-secondary mb-1">We come to you</div>
            <p className="text-sm text-secondary/70">Same‑day availability. 25‑mile radius included.</p>
          </div>
          <div className="bg-white rounded-xl border border-black/10 p-6">
            <CheckCircle className="mx-auto h-6 w-6 text-secondary mb-3" />
            <div className="font-medium text-secondary mb-1">Signed & done</div>
            <p className="text-sm text-secondary/70">Verified ID, notarized on the spot. Receipt emailed.</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <a href="/faq" className="text-secondary underline underline-offset-4">See FAQs</a>
        </div>
      </div>
    </section>
  )
}


