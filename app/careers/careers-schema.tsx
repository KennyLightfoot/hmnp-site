import { JsonLd } from "react-schemaorg"

export function CareersSchema() {
  return (
    <JsonLd<any>
      item={{
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: "Mobile Notary - Loan Signing Specialist",
        description:
          "We're seeking experienced Notary Signing Agents who specialize in loan signings to join our growing team. In this role, you'll travel to clients' locations to facilitate the signing of loan documents.",
        datePosted: new Date().toISOString(),
        validThrough: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        employmentType: "FULL_TIME",
        hiringOrganization: {
          "@type": "Organization",
          name: "Houston Mobile Notary Pros",
          sameAs: "https://houstonmobilenotarypros.com",
          logo: "https://houstonmobilenotarypros.com/logo.png",
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Houston",
            addressRegion: "TX",
            addressCountry: "US",
          },
        },
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: 40000,
            maxValue: 80000,
            unitText: "YEAR",
          },
        },
        qualifications:
          "Active Texas Notary Public commission, Certified Notary Signing Agent (preferred), Reliable transportation and valid driver's license",
        skills: "Loan document signing, notarization, customer service, attention to detail",
        educationRequirements: "High school diploma or equivalent",
        experienceRequirements: "1+ years of experience as a notary public, experience with loan signings preferred",
      }}
    />
  )
}

