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
  baytown: [
    { question: "Can you notarize at Baytown Nature Center or refinery offices?", answer: "Yes. We frequently meet clients at Baytown Nature Center, refinery administrative buildings, and nearby coffee shops for discreet signings." },
    { question: "Do you accommodate 24/7 refinery shifts?", answer: "Absolutely. We offer overnight and early-morning appointments to match Baytown's rotating shift schedules." },
  ],
  channelview: [
    { question: "Will you travel to petrochemical yards in Channelview?", answer: "Yes, secured facilities along the San Jacinto River are within our service area—just arrange gate access in advance." },
    { question: "Can you meet at Sheldon Lake State Park?", answer: "Park entrances and public picnic areas make convenient spots for Channelview signings." },
  ],
  humble: [
    { question: "Do you handle hospital notarizations near Humble?", answer: "We meet families at Memorial Hermann Northeast Hospital and Kingwood Emergency Rooms with proper ID for each signer." },
    { question: "Evening loan signings in Atascocita?", answer: "Yes, we host NNA-certified agents who can accommodate evening HELOC and refinance packages across Humble and Atascocita." },
  ],
  kingwood: [
    { question: "Can you come to Kingwood's village clubhouses?", answer: "Yes, community clubhouses and Kingwood Town Center offices are common meeting locations—we arrive early to secure signing space." },
    { question: "Is there a travel fee for Kings River or Kings Point?", answer: "No additional fee—those neighborhoods fall within our 20-mile standard radius." },
  ],
  katy: [
    { question: "Do you offer mobile notary support for Energy Corridor commuters?", answer: "We schedule morning and lunchtime appointments along I-10 so you can notarize documents without missing work." },
    { question: "Can you meet at Katy Mills or LaCenterra?", answer: "Yes, we routinely meet clients at Katy Mills Mall, LaCenterra, and area libraries—just pick the spot that works best." },
  ],
  cypress: [
    { question: "Are Towne Lake and Bridgeland within your coverage?", answer: "Absolutely. We navigate gated communities and will meet at your home, amenity center, or a nearby cafe." },
    { question: "Do you notarize for Cypress-Fairbanks ISD employees?", answer: "Yes, we support HR onboarding, I-9 verification, and school documents across the Cypress area." },
  ],
  spring: [
    { question: "Do you service Old Town Spring businesses?", answer: "Yes, we walk historic Main Street to meet boutique owners and vendors for quick notarizations." },
    { question: "How fast can you arrive in the Rayford/Grand Parkway area?", answer: "Most Spring appointments are confirmed within 90 minutes, including locations near the Grand Parkway and Exxon campus." },
  ],
  tomball: [
    { question: "Will you travel to Tomball Regional Medical Center?", answer: "Yes, hospital notarizations are available—please confirm the patient has valid ID and witnesses if required." },
    { question: "Can you meet at Tomball's Depot Plaza?", answer: "We can meet downtown at Depot Plaza, local coffee shops, or your acreage property—whatever is most convenient." },
  ],
  richmond: [
    { question: "Do you handle estate documents in Pecan Grove?", answer: "Yes, estate planning and trust signings in Pecan Grove and Harvest Green are a daily part of our Richmond route." },
    { question: "Is George Ranch Historical Park a meeting option?", answer: "We can meet at the visitor center or parking lots before events—just schedule at least two hours ahead." },
  ],
  rosenberg: [
    { question: "Can you notarize at the Fort Bend County Fairgrounds?", answer: "Yes, we serve vendors and exhibitors on-site during events—outdoor tables or RV offices work perfectly." },
    { question: "What about factory and distribution center appointments?", answer: "Rosenberg industrial parks are within range. Provide gate instructions and we’ll handle employee or HR notarizations on schedule." },
  ],
  "the-woodlands": [
    { question: "Do you meet at The Woodlands hospitals?", answer: "Yes, we routinely visit Memorial Hermann The Woodlands, St. Luke’s, and MD Anderson The Woodlands for bedside notarizations—valid ID is required for each signer." },
    { question: "Can you come to gated villages like Sterling Ridge or Creekside?", answer: "Absolutely. Provide gate access instructions and we’ll meet you at home, the village center, or Hughes Landing." },
  ],
  "river-oaks": [
    { question: "Do you handle estate signings in River Oaks homes?", answer: "Yes, our notaries are experienced with wealth management and estate planning documents—witnesses can be coordinated upon request." },
    { question: "Is discreet service available for corporate offices?", answer: "We offer concierge-style visits to River Oaks District, Highland Village, and private law offices with minimal disruption." },
  ],
  "west-university": [
    { question: "Can you meet at Rice University or West U libraries?", answer: "Yes, campus libraries, coffee shops, and civic buildings in West University Place are common meeting locations." },
    { question: "Do you serve the Texas Medical Center housing towers?", answer: "We meet residents and families in TMC housing, Ronald McDonald House, and nearby apartments with short notice." },
  ],
  bellaire: [
    { question: "Do you offer same-day notarization in Bellaire 77401?", answer: "Yes, most Bellaire requests are handled within two hours, including post office and city permits." },
    { question: "Can you meet at Evelyn’s Park or local hospitals?", answer: "Absolutely—parks, hospitals, and municipal buildings in Bellaire are within our core service zone." },
  ],
  "midtown-houston": [
    { question: "Do you visit Midtown co-working spaces?", answer: "Yes, we frequent WeWork, Station Houston, and other co-working hubs—just book a conference room or lobby table." },
    { question: "Can you accommodate late-evening signings?", answer: "Midtown appointments are available through 10 PM, perfect for restaurant and nightlife staff schedules." },
  ],
  "medical-center": [
    { question: "What is required for hospital notarizations in the Texas Medical Center?", answer: "Ensure the signer has valid photo ID and is alert; we’ll bring witness forms if the hospital cannot provide staff witnesses." },
    { question: "Do you handle medical power of attorney documents?", answer: "Yes, MPOA, HIPAA releases, and advanced directives are notarized daily across the TMC campuses." },
  ],
  "houston-heights": [
    { question: "Do you service historic homes and townhomes in The Heights?", answer: "We’re familiar with gated townhomes and historic residences—driveway or porch signings are common." },
    { question: "Weekend availability for Heights-area businesses?", answer: "Yes, we support weekend markets, boutique owners, and homebuyers with Saturday and Sunday appointments." },
  ],
  // End of city FAQs
}
