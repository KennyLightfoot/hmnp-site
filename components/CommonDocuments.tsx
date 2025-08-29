"use client"

import Link from 'next/link'
import { track } from '@/app/lib/analytics'

type Doc = { label: string; serviceType?: string; act?: string }

const docs: Doc[] = [
  { label: 'Power of Attorney', act: 'POA' },
  { label: 'I‑9 Employment', act: 'I9' },
  { label: 'Title/DMV', act: 'DMV' },
  { label: 'School Forms', act: 'SCHOOL' },
  { label: 'Affidavit', act: 'AFFIDAVIT' },
  { label: 'Deed/Real Estate', act: 'DEED' },
  { label: 'Medical/Consent', act: 'MEDICAL' },
  { label: 'VIN Verification', act: 'VIN' },
  { label: 'Loan Signing', serviceType: 'LOAN_SIGNING' },
  { label: 'Online Notary (RON)', serviceType: 'RON_SERVICES' },
]

export default function CommonDocuments() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Common Documents</h2>
        <p className="text-secondary/70 mb-4 text-sm">Quick-select a document to prefill your booking.</p>
        <div className="flex flex-wrap gap-2">
          {docs.map((d) => {
            const params = new URLSearchParams()
            if (d.serviceType) params.set('serviceType', d.serviceType)
            if (d.act) params.set('act', d.act)
            return (
              <Link
                key={d.label}
                href={`/booking?${params.toString()}`}
                className="px-3 py-1.5 rounded-full text-sm border border-black/10 text-[#0F1419]/80 hover:text-[#0F1419] hover:border-black/20 transition-colors"
                onClick={() => track('cta_click', { cta_name: 'doc_chip', doc: d.label, location: 'common_docs' })}
              >
                {d.label}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}


