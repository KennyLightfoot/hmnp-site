export interface FAQ {
  question: string
  answer: string
}

export const CITY_FAQS: Record<string, FAQ[]> = {
  "clear-lake-city": [
    {
      question: "Do you offer after-hours notarization in Clear Lake City?",
      answer: "Yes. We provide after-hours and weekend appointments to accommodate your busy schedule in Clear Lake City and nearby neighborhoods such as Brookwood and Bay Oaks. Evening appointments are available until 9 PM daily.",
    },
    {
      question: "What is your travel fee within ZIP codes 77058, 77059, and 77062?",
      answer: "Travel is included for the first 20 miles from our base. Clear Lake City addresses in those ZIP codes are typically covered at no extra cost. We serve NASA employees, Clear Lake residents, and businesses throughout the area.",
    },
    {
      question: "Can you meet at NASA Johnson Space Center?",
      answer: "Absolutely. We frequently meet clients outside the NASA visitor center entrance or nearby coffee shops for convenient signings. We're familiar with NASA security protocols and can meet at Space Center Houston or nearby locations.",
    },
    {
      question: "Do you serve Baybrook Mall and Clear Lake Regional Medical Center?",
      answer: "Yes, we frequently meet clients at Baybrook Mall, Clear Lake Regional Medical Center, and nearby businesses. Hospital signings are common, and we can accommodate in-room notarizations with proper ID verification.",
    },
    {
      question: "What types of documents do you notarize for NASA employees?",
      answer: "We handle all standard notarizations including employment affidavits, security clearance documents, contractor agreements, and personal documents. We're familiar with federal document requirements and maintain confidentiality standards.",
    },
    {
      question: "Do you offer same-day service in Clear Lake City?",
      answer: "Yes, most Clear Lake City appointments can be scheduled within 2 hours. We maintain dedicated coverage for this area due to high demand from NASA employees and Clear Lake residents.",
    },
  ],
  pasadena: [
    { question: "Do you charge travel fees in Pasadena?", answer: "Travel is free within 20 miles. Beyond that, we charge $0.50 per additional mile. Most Pasadena locations including ZIP codes 77502–77506 are within our standard radius." },
    { question: "Are loan signing services available same-day?", answer: "Yes. With a minimum 2-hour notice, we can accommodate most loan packages in Pasadena. Our NNA-certified loan signing agents specialize in purchase agreements, refinances, and HELOCs." },
    { question: "Which areas of Pasadena do you cover?", answer: "We serve all ZIP codes 77502–77506 and landmarks like Strawberry Park and Pasadena Convention Center. We also cover Fairmont Parkway, Spencer Highway, and the Pasadena Memorial area." },
    { question: "Can you meet at Bayshore Medical Center or Pasadena hospitals?", answer: "Yes, we frequently serve Bayshore Medical Center, Houston Methodist Baytown, and other medical facilities in Pasadena. Hospital signings require valid ID and we can coordinate witnesses if needed." },
    { question: "Do you offer weekend appointments in Pasadena?", answer: "Yes, we provide Saturday appointments 8 AM–6 PM and Sunday service by request. Pasadena is a high-demand area, especially for real estate closings, so we recommend booking weekend slots in advance." },
    { question: "What types of documents do you notarize in Pasadena?", answer: "We handle all standard notarizations including real estate documents, loan signings, power of attorney forms, wills, affidavits, business contracts, and immigration documents. We're experienced with both personal and commercial notarizations." },
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
    { question: "Same-day notary in League City?", answer: "Most requests in 77573 and 77574 can be handled within 2 hours. We prioritize League City appointments due to high demand and maintain quick response times throughout the area." },
    { question: "Can you meet at UTMB League City?", answer: "Yes—hospital signings are routine; remember patient ID requirements. We also serve Houston Methodist St. Catherine Hospital, Clear Lake Regional Medical Center, and other medical facilities in League City." },
    { question: "What ZIP codes in League City do you serve?", answer: "We cover all League City ZIP codes including 77573 and 77574. Our service area includes League Park, South Shore Harbour, Walter Hall Park, and Helen Hall Library neighborhoods." },
    { question: "Do you handle real estate closings in League City?", answer: "Yes, our certified loan signing agents specialize in purchase agreements, refinances, HELOCs, and reverse mortgages. We're experienced with all major lenders and title companies serving League City." },
    { question: "Can you meet at League City Town Center or South Shore Harbour?", answer: "Absolutely. League City Town Center, South Shore Harbour Marina, and nearby coffee shops are popular meeting locations. We can also come to your home or office." },
    { question: "What is your availability for weekend appointments in League City?", answer: "We offer Saturday appointments 8 AM–6 PM and Sunday service by request. League City is a high-demand area, so we recommend booking weekend slots in advance." },
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
    { question: "Notarization at Galveston cruise terminal?", answer: "Yes, we meet passengers curb-side before embarkation. We're familiar with cruise schedules and can accommodate last-minute signings before departure. We also serve hotels near the Strand and Seawall Boulevard." },
    { question: "Do you handle apostille courier for island residents?", answer: "We ship documents to Austin for apostille and return via overnight service. This is especially convenient for Galveston residents who don't want to make the trip to Austin. We handle the entire process from pickup to delivery." },
    { question: "Parking fees at UTMB?", answer: "Any garage fee is passed through at cost; we keep visits under one hour. We're experienced with UTMB Galveston hospital signings and can coordinate with hospital staff for patient notarizations." },
    { question: "What ZIP codes in Galveston do you serve?", answer: "We cover all Galveston ZIP codes including 77550, 77551, and 77554. Our service area includes the Historic Strand District, Seawall Boulevard, Pleasure Pier, and all Galveston Island neighborhoods." },
    { question: "Do you offer weekend appointments in Galveston?", answer: "Yes, we provide Saturday appointments 8 AM–6 PM and Sunday service by request. Galveston is a popular weekend destination, so we maintain flexible scheduling for tourists and residents alike." },
    { question: "Can you meet at Moody Gardens or The Strand?", answer: "Absolutely. We frequently meet clients at Moody Gardens, The Strand Historic District, Pleasure Pier, and nearby restaurants. These locations offer convenient parking and comfortable signing environments." },
  ],
  "brazoria-county": [
    { question: "Do you serve rural areas of Brazoria County?", answer: "Yes, we travel to farms and rural residences across Brazoria County with advance notice." },
    { question: "What ZIP codes in Brazoria County are covered?", answer: "We cover 77511, 77578, 77584, and surrounding areas." },
  ],
  pearland: [
    { question: "Do you offer same-day service in Pearland?", answer: "Yes, most Pearland appointments can be scheduled within 2 hours. We serve all Pearland ZIP codes including 77581, 77584, and 77588 with rapid response times." },
    { question: "Meeting spots in Shadow Creek Ranch?", answer: "We often meet at cafes near Shadow Creek Ranch or at Pearland Town Center. Other popular locations include Independence Park, Pearland Recreation Center, and Houston Methodist Pearland Hospital." },
    { question: "What types of documents do you notarize in Pearland?", answer: "We handle all standard notarizations including real estate documents, loan signings, power of attorney forms, wills, affidavits, and business contracts. Our NNA-certified loan signing agents specialize in mortgage closings and refinance packages." },
    { question: "Do you charge travel fees for Pearland addresses?", answer: "Travel is included for the first 20 miles from our base. Most Pearland locations fall within this radius, so there's typically no additional travel fee. We'll confirm any extra charges before your appointment." },
    { question: "Can you meet at Pearland Town Center or local businesses?", answer: "Absolutely. We frequently meet clients at Pearland Town Center, local coffee shops, libraries, and business offices. Just specify your preferred location when booking." },
    { question: "Do you offer weekend and evening appointments in Pearland?", answer: "Yes, we provide flexible scheduling including evenings, weekends, and holidays. Saturday appointments are available 8 AM–6 PM, and Sunday service is available by request." },
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
    { question: "Can you notarize at Baytown Nature Center or refinery offices?", answer: "Yes. We frequently meet clients at Baytown Nature Center, refinery administrative buildings, and nearby coffee shops for discreet signings. We're familiar with refinery security protocols and can meet at designated visitor areas." },
    { question: "Do you accommodate 24/7 refinery shifts?", answer: "Absolutely. We offer overnight and early-morning appointments to match Baytown's rotating shift schedules. We understand refinery workers need flexible scheduling and can accommodate off-hours requests." },
    { question: "What ZIP codes in Baytown do you serve?", answer: "We cover all Baytown ZIP codes including 77520, 77521, and 77523. Our service area includes downtown Baytown, the refinery corridor, and residential neighborhoods throughout the area." },
    { question: "Do you handle loan signings for Baytown residents?", answer: "Yes, our NNA-certified loan signing agents specialize in mortgage closings, refinances, and HELOCs. We're experienced with all major lenders and title companies serving the Baytown area." },
    { question: "Can you meet at Houston Methodist Baytown or Pirates Bay Waterpark?", answer: "Yes, we frequently meet clients at Houston Methodist Baytown Hospital, Pirates Bay Waterpark, and nearby locations. Hospital signings are common, and we can accommodate in-room notarizations." },
    { question: "Do you offer same-day service in Baytown?", answer: "Yes, most Baytown appointments can be scheduled within 2-3 hours. We maintain dedicated coverage for this area due to high demand from refinery workers and Baytown residents." },
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
    { question: "Do you offer mobile notary support for Energy Corridor commuters?", answer: "We schedule morning and lunchtime appointments along I-10 so you can notarize documents without missing work. We serve Katy, Cinco Ranch, and Energy Corridor offices with flexible scheduling." },
    { question: "Can you meet at Katy Mills or LaCenterra?", answer: "Yes, we routinely meet clients at Katy Mills Mall, LaCenterra, and area libraries—just pick the spot that works best. Other popular locations include Memorial Hermann Katy Hospital and Typhoon Texas." },
    { question: "What ZIP codes in Katy do you serve?", answer: "We cover all Katy ZIP codes including 77449, 77450, and 77494. Our service area includes Old Katy, Cinco Ranch, Grand Lakes, and communities along I-10 and the Grand Parkway." },
    { question: "Do you handle loan signings in Katy?", answer: "Yes, our NNA-certified loan signing agents specialize in mortgage closings, refinances, and HELOCs. We're experienced with all major lenders and title companies serving the Katy area." },
    { question: "What is your travel fee for Katy addresses?", answer: "Travel is included for the first 20 miles. Most Katy locations are within this radius, but some areas beyond the Grand Parkway may incur a small additional fee—we'll confirm before booking." },
    { question: "Do you offer weekend appointments in Katy?", answer: "Yes, we provide Saturday appointments 8 AM–6 PM and Sunday service by request. Katy is a high-demand area, especially for real estate closings, so weekend slots fill quickly." },
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
    { question: "Do you meet at The Woodlands hospitals?", answer: "Yes, we routinely visit Memorial Hermann The Woodlands, St. Luke's, and MD Anderson The Woodlands for bedside notarizations—valid ID is required for each signer. We also serve patients at Houston Methodist The Woodlands Hospital." },
    { question: "Can you come to gated villages like Sterling Ridge or Creekside?", answer: "Absolutely. Provide gate access instructions and we'll meet you at home, the village center, or Hughes Landing. We're familiar with all The Woodlands villages including Grogan's Mill, Panther Creek, and Cochran's Crossing." },
    { question: "What ZIP codes in The Woodlands do you cover?", answer: "We serve all The Woodlands ZIP codes including 77380, 77381, and 77382. Our service area extends to Market Street, The Woodlands Mall, Hughes Landing, and all village centers." },
    { question: "Do you offer same-day service in The Woodlands?", answer: "Yes, most The Woodlands appointments can be scheduled within 2-3 hours. We maintain dedicated coverage for this area due to high demand from corporate offices and residential communities." },
    { question: "Can you meet at The Woodlands Mall or Market Street?", answer: "Yes, we frequently meet clients at The Woodlands Mall, Market Street, Hughes Landing, and nearby restaurants. These locations offer convenient parking and comfortable signing environments." },
    { question: "Do you handle estate planning documents in The Woodlands?", answer: "Absolutely. We notarize wills, trusts, power of attorney forms, and advanced directives throughout The Woodlands. Our notaries are experienced with complex estate documents and can coordinate witnesses if needed." },
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
  houston: [
    {
      question: "Do you offer mobile notary services throughout Houston?",
      answer: "Yes, we provide comprehensive mobile notary coverage across all Houston neighborhoods including downtown, Medical Center, Heights, Midtown, River Oaks, and surrounding areas. We travel to your location 7 days a week.",
    },
    {
      question: "What ZIP codes in Houston do you serve?",
      answer: "We serve all Houston ZIP codes including 77002 (downtown), 77004, 77005, 77019, 77027, 77030 (Medical Center), 77008 (Heights), 77009, and many more. Our service area covers the entire Houston metro region.",
    },
    {
      question: "Can you meet at downtown Houston offices or the Medical Center?",
      answer: "Absolutely. We frequently serve downtown Houston offices, the Texas Medical Center, and corporate buildings throughout the city. We're familiar with parking and security protocols at major business districts.",
    },
    {
      question: "Do you handle loan signings for Houston residents?",
      answer: "Yes, our NNA-certified loan signing agents specialize in mortgage closings, refinances, HELOCs, and reverse mortgages throughout Houston. We're experienced with all major lenders and title companies serving the Houston area.",
    },
    {
      question: "What is your travel fee for Houston addresses?",
      answer: "Travel is included for the first 20 miles from our base. Most Houston locations fall within this radius. For areas beyond 20 miles, we charge $0.50 per additional mile—we'll confirm any extra charges before booking.",
    },
    {
      question: "Do you offer same-day and emergency notary service in Houston?",
      answer: "Yes, most Houston appointments can be scheduled within 2-3 hours. We offer emergency same-day service for urgent situations including hospital signings, real estate closings, and time-sensitive documents.",
    },
  ],
  "houston-heights": [
    { question: "Do you service historic homes and townhomes in The Heights?", answer: "We're familiar with gated townhomes and historic residences—driveway or porch signings are common." },
    { question: "Weekend availability for Heights-area businesses?", answer: "Yes, we support weekend markets, boutique owners, and homebuyers with Saturday and Sunday appointments." },
  ],
  "sugar-land": [
    {
      question: "Do you offer mobile notary services in Sugar Land?",
      answer: "Yes, we provide comprehensive mobile notary coverage throughout Sugar Land including First Colony, New Territory, Greatwood, and all Sugar Land neighborhoods. We travel to your location 7 days a week.",
    },
    {
      question: "What ZIP codes in Sugar Land do you serve?",
      answer: "We serve all Sugar Land ZIP codes including 77479, 77478, and 77496. Our service area covers Sugar Land Town Square, First Colony, New Territory, Greatwood, and surrounding communities.",
    },
    {
      question: "Can you meet at Sugar Land Town Square or Smart Financial Centre?",
      answer: "Absolutely. We frequently meet clients at Sugar Land Town Square, Smart Financial Centre, First Colony Mall, and nearby restaurants. These locations offer convenient parking and comfortable signing environments.",
    },
    {
      question: "Do you handle loan signings for Sugar Land residents?",
      answer: "Yes, our NNA-certified loan signing agents specialize in mortgage closings, refinances, HELOCs, and reverse mortgages throughout Sugar Land. We're experienced with all major lenders and title companies serving the area.",
    },
    {
      question: "What is your travel fee for Sugar Land addresses?",
      answer: "Travel is included for the first 20 miles from our base. Most Sugar Land locations fall within this radius, so there's typically no additional travel fee. We'll confirm any extra charges before your appointment.",
    },
    {
      question: "Do you offer weekend appointments in Sugar Land?",
      answer: "Yes, we provide Saturday appointments 8 AM–6 PM and Sunday service by request. Sugar Land is a high-demand area, especially for real estate closings, so we recommend booking weekend slots in advance.",
    },
  ],
  // End of city FAQs
}
