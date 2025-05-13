export interface FAQ {
  question: string
  answer: string
}

export const CITY_FAQS: Record<string, FAQ[]> = {
  "clear-lake-city": [
    {
      question: "Do you offer after-hours notarization in Clear Lake City?",
      answer: "Yes. We provide after-hours and weekend appointments to accommodate your busy schedule in Clear Lake City and nearby neighborhoods such as Brookwood and Bay Oaks.",
    },
    {
      question: "What is your travel fee within ZIP codes 77058, 77059, and 77062?",
      answer: "Travel is included for the first 20 miles from our base. Clear Lake City addresses in those ZIP codes are typically covered at no extra cost.",
    },
    {
      question: "Can you meet at NASA Johnson Space Center?",
      answer: "Absolutely. We frequently meet clients outside the NASA visitor center entrance or nearby coffee shops for convenient signings.",
    },
  ],
  pasadena: [
    { question: "Do you charge travel fees in Pasadena?", answer: "Travel is free within 20 miles. Beyond that, we charge $0.50 per additional mile." },
    { question: "Are loan signing services available same-day?", answer: "Yes. With a minimum 2-hour notice, we can accommodate most loan packages in Pasadena." },
    { question: "Which areas of Pasadena do you cover?", answer: "We serve all ZIP codes 77502–77506 and landmarks like Strawberry Park and Pasadena Convention Center." },
  ],
  "texas-city": [
    { question: "Is there a discount for Texas City residents?", answer: "Yes, Texas City is our home base, so we waive travel within ZIP 77590 and 77591." },
    { question: "Do you provide apostille service pickup?", answer: "We can pick up documents in Texas City, obtain the apostille in Austin, and return them via overnight shipping." },
  ],
  webster: [
    { question: "Can you notarize at Bay Area Regional Medical Center?", answer: "Yes, hospital signings are common—we bring witness forms if needed." },
    { question: "Do you handle immigration forms?", answer: "We can notarize most USCIS affidavits and translations, but we do not provide legal advice." },
  ],
  "nassau-bay": [
    { question: "Can you come to my boat slip in Nassau Bay Marina?", answer: "Yes, dockside and marina appointments in Nassau Bay are within our standard travel area." },
    { question: "Is there an extra fee for 77058 addresses?", answer: "No. ZIP 77058 is inside our 20-mile radius so no travel surcharge applies." },
  ],
  seabrook: [
    { question: "Do you meet at Seabrook Waterfront District?", answer: "Absolutely—restaurants and offices along Todville Road are popular meeting spots." },
    { question: "Evening notarization in 77586?", answer: "We accept bookings until 9 PM for Seabrook ZIP 77586." },
  ],
  "clear-lake-shores": [
    { question: "Dockside notarization available?", answer: "Yes—our notary boards your vessel or meets at the marina clubhouse." },
    { question: "Any surcharge for island addresses?", answer: "No, Clear Lake Shores is within our standard radius." },
  ],
  "taylor-lake-village": [
    { question: "Can we meet at Clear Lake Park?", answer: "Yes, the pavilion parking lot is a convenient public spot." },
    { question: "Do you handle power of attorney forms?", answer: "We can notarize POAs, wills, and most legal documents." },
  ],
  friendswood: [
    { question: "Do you serve 77546?", answer: "Yes, travel within Friendswood 77546 is covered." },
    { question: "Preferred meeting locations?", answer: "Stevenson Park, the public library, or your residence all work." },
    { question: "Saturday appointments?", answer: "Saturday slots are open 8 AM–6 PM." },
  ],
  "league-city": [
    { question: "Same-day notary in League City?", answer: "Most requests in 77573 can be handled within 2 hours." },
    { question: "Can you meet at UTMB League City?", answer: "Yes—hospital signings are routine; remember patient ID requirements." },
  ],
  kemah: [
    { question: "Weekend notarizations on Kemah Boardwalk?", answer: "Yes, we meet visitors at the Boardwalk hotels or marina." },
    { question: "Can you notarize I-9 for seasonal staff?", answer: "Absolutely; bring Section 1 completed and employee IDs." },
  ],
  "la-porte": [
    { question: "Do you travel to Sylvan Beach?", answer: "Yes, the entire La Porte shoreline is covered." },
    { question: "Is parking fee reimbursement included?", answer: "Any paid parking is passed through at cost." },
  ],
  "deer-park": [
    { question: "Meet at Battleground Golf Course?", answer: "Yes, outdoor tables near the clubhouse are ideal." },
    { question: "Do you support VA loan packages?", answer: "We are experienced with VA and FHA loan signings." },
  ],
  "south-houston": [
    { question: "Spanish-speaking notary available?", answer: "Sí, ofrecemos servicios de notaría en español en South Houston." },
    { question: "Hospital notarizations at CHI St. Luke's?", answer: "We handle in-room signings; bedside witnesses can be arranged." },
  ],
  "la-marque": [
    { question: "Travel to rural La Marque farms?", answer: "Yes, we travel gravel roads and rural routes within 20 miles." },
    { question: "Can you meet at Gulf Greyhound Park?", answer: "Yes, parking lot or lounge area works well." },
  ],
  dickinson: [
    { question: "Notary near Dickinson Bayou?", answer: "We meet at Paul Hopkins Park or your waterfront home." },
    { question: "Do you charge extra in 77539?", answer: "No, 77539 is within our standard radius." },
  ],
  "santa-fe": [
    { question: "Will you come to Haak Vineyards & Winery?", answer: "Yes, mobile notarization during events is available with advance notice." },
    { question: "Evening service after 7 PM?", answer: "Priority service hours run until 9 PM daily in Santa Fe." },
  ],
  galveston: [
    { question: "Notarization at Galveston cruise terminal?", answer: "Yes, we meet passengers curb-side before embarkation." },
    { question: "Do you handle apostille courier for island residents?", answer: "We ship documents to Austin for apostille and return via overnight service." },
    { question: "Parking fees at UTMB?", answer: "Any garage fee is passed through at cost; we keep visits under one hour." },
  ],
  "brazoria-county": [
    { question: "Do you serve rural areas of Brazoria County?", answer: "Yes, we travel to farms and rural residences across Brazoria County with advance notice." },
    { question: "What ZIP codes in Brazoria County are covered?", answer: "We cover 77511, 77578, 77584, and surrounding areas." },
  ],
  pearland: [
    { question: "Do you offer same-day service in Pearland?", answer: "Yes, most Pearland appointments can be scheduled within 2 hours." },
    { question: "Meeting spots in Shadow Creek Ranch?", answer: "We often meet at cafes near Shadow Creek Ranch or at Pearland Town Center." },
  ],
  alvin: [
    { question: "Can you meet at Alvin Community College?", answer: "Yes, the college library lobby is a convenient location for signings." },
    { question: "Do you notarize at hospitals in Alvin?", answer: "We travel to hospitals and nursing facilities in Alvin—please ensure the signer has valid ID." },
  ],
  manvel: [
    { question: "Evening appointments in Manvel?", answer: "We accept bookings until 9 PM in Manvel and surrounding neighborhoods." },
    { question: "Do you handle HELOC packages?", answer: "Yes, our notaries are NNA-certified loan signing agents experienced with HELOC documents." },
  ],
  hitchcock: [
    { question: "Do you travel to Jack Brooks Park?", answer: "Absolutely—park pavilions and parking lots are common meeting spots in Hitchcock." },
    { question: "Any surcharge for 77563?", answer: "No, Hitchcock 77563 is within our standard travel radius—no extra fee." },
  ],
  // End of city FAQs
}
