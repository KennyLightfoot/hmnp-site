export interface CityInfo {
  zipCodes: string[]
  landmarks: string[]
}

export const CITY_INFO: Record<string, CityInfo> = {
  "clear-lake-city": {
    zipCodes: ["77058", "77059", "77062"],
    landmarks: ["NASA Johnson Space Center", "Clear Lake", "Baybrook Mall"],
  },
  pasadena: {
    zipCodes: ["77502", "77503", "77504"],
    landmarks: ["Pasadena Convention Center", "Strawberry Park"],
  },
  "texas-city": {
    zipCodes: ["77590", "77591"],
    landmarks: ["Texas City Dike", "Tanger Outlets Houston"],
  },
  webster: {
    zipCodes: ["77598"],
    landmarks: ["Bay Area Regional Medical Center", "NASA Parkway"]
  },
  "nassau-bay": {
    zipCodes: ["77058"],
    landmarks: ["Nassau Bay Peninsula Wildlife Park", "Space Center Houston"],
  },
  seabrook: {
    zipCodes: ["77586"],
    landmarks: ["Seabrook Waterfront District", "Kemah Boardwalk"],
  },
  "clear-lake-shores": {
    zipCodes: ["77565"],
    landmarks: ["Clear Lake Shores Marina", "Jarboe Bayou Park"],
  },
  "taylor-lake-village": {
    zipCodes: ["77586"],
    landmarks: ["Taylor Lake", "Clear Lake Park"],
  },
  friendswood: {
    zipCodes: ["77546"],
    landmarks: ["Stevenson Park", "Friendswood City Pool"],
  },
  "league-city": {
    zipCodes: ["77573", "77574"],
    landmarks: ["Walter Hall Park", "League Park"],
  },
  kemah: {
    zipCodes: ["77565"],
    landmarks: ["Kemah Boardwalk", "Clear Lake Channel"],
  },
  "la-porte": {
    zipCodes: ["77571"],
    landmarks: ["San Jacinto Battleground", "Sylvan Beach Park"],
  },
  "deer-park": {
    zipCodes: ["77536"],
    landmarks: ["Battleground Golf Course", "Deer Park Nature Reserve"],
  },
  "south-houston": {
    zipCodes: ["77587"],
    landmarks: ["Cristo Rey Catholic Church", "South Houston Intermediate"],
  },
  "la-marque": {
    zipCodes: ["77568"],
    landmarks: ["La Marque Bayou Fest Grounds", "Carnegie Library"],
  },
  dickinson: {
    zipCodes: ["77539"],
    landmarks: ["Dickinson Bayou", "Paul Hopkins Park"],
  },
  "santa-fe": {
    zipCodes: ["77510"],
    landmarks: ["Haak Vineyards & Winery", "Runge Park"],
  },
  galveston: {
    zipCodes: ["77550", "77551", "77554"],
    landmarks: ["Moody Gardens", "Pleasure Pier", "The Strand Historic District"],
  },
  pearland: {
    zipCodes: ["77581", "77584", "77588"],
    landmarks: ["Pearland Town Center", "Shadow Creek Ranch", "Centennial Park"],
  },
  alvin: {
    zipCodes: ["77511"],
    landmarks: ["Nolan Ryan Museum", "Alvin Community College", "Hillcrest Golf Club"],
  },
  manvel: {
    zipCodes: ["77578"],
    landmarks: ["Manvel Town Center", "Rodeo Palms", "Manvel City Hall"],
  },
  hitchcock: {
    zipCodes: ["77563"],
    landmarks: ["Jack Brooks Park", "Harborwalk Marina", "Highland Bayou Park"],
  },
  "brazoria-county": {
    zipCodes: ["77511", "77578", "77584"],
    landmarks: ["Brazoria National Wildlife Refuge", "Brazoria County Courthouse", "Angleton Fairgrounds"],
  },
}
