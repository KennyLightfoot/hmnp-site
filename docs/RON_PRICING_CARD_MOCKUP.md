# RON Pricing Card Mockup

## Overview
This document provides a mockup for the Remote Online Notarization (RON) pricing card that will be added to the Pricing page's service comparison section.

## UI Design

```jsx
<Card className="shadow-lg border-primary/10 hover:border-primary/20 transition-all duration-300">
  <CardHeader className="bg-gradient-to-br from-blue-50 to-sky-50 pb-2">
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-xl font-serif">Remote Online Notarization</CardTitle>
        <CardDescription className="mt-1">
          Secure remote notarization via video
        </CardDescription>
      </div>
      <ComputerIcon className="h-8 w-8 text-sky-600" />
    </div>
  </CardHeader>
  
  <CardContent className="pt-4">
    <div className="flex items-baseline mb-6">
      <span className="text-3xl font-bold">$25</span>
      <span className="text-sm text-gray-500 ml-1">/act base price</span>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Travel included:</span>
        <span className="font-medium text-gray-900">N/A — fully remote</span>
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Documents:</span>
        <span className="font-medium text-gray-900">Unlimited</span>
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Signers:</span>
        <span className="font-medium text-gray-900">Up to 2 per session</span>
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Hours:</span>
        <span className="font-medium text-gray-900">7am–9pm daily</span>
      </div>
    </div>
    
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-3">What's Included:</h4>
      <ul className="space-y-2">
        <li className="flex items-start">
          <CheckIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">Knowledge-based authentication (KBA)</span>
        </li>
        
        <li className="flex items-start">
          <CheckIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">AV recording stored securely</span>
        </li>
        
        <li className="flex items-start">
          <CheckIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">Digital notary seal</span>
        </li>
        
        <li className="flex items-start">
          <CheckIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">Same-day sessions available</span>
        </li>
        
        <li className="flex items-start">
          <CheckIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">No travel required</span>
        </li>
      </ul>
    </div>
    
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-3">Add-ons:</h4>
      <ul className="space-y-2">
        <li className="flex items-start">
          <PlusCircleIcon className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">Additional signers: +$10 each</span>
        </li>
        
        <li className="flex items-start">
          <PlusCircleIcon className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700">Additional notarial acts: +$25 each</span>
        </li>
      </ul>
    </div>
    
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-2">Best For:</h4>
      <p className="text-sm text-gray-700">
        Out-of-state signers, remote closings, clients unable to meet in person, time-sensitive documents
      </p>
    </div>
  </CardContent>
  
  <CardFooter className="pt-2 pb-6">
    <Button className="w-full" asChild>
      <Link href="/booking?mode=RON">Book RON Session</Link>
    </Button>
  </CardFooter>
</Card>
```

## Design Notes

1. **Layout Structure:**
   - Header with title, description, and icon
   - Pricing section
   - Service details (travel, documents, signers, hours)
   - What's included list
   - Add-ons list
   - Best for section
   - Book button in footer

2. **Key Components:**
   - Card container with hover effect
   - Price display with per-act notation
   - Feature lists with icons
   - Clear CTA button

3. **Styling:**
   - Matches the existing price card designs
   - Uses subtle blue gradient background in header
   - Consistent spacing and typography
   - Visual separators between sections

4. **Content Focus:**
   - Clear pricing structure
   - Emphasis on what's included
   - Transparent about add-on costs
   - Targeted use cases

5. **Call-to-Action:**
   - "Book RON Session" button links directly to booking form with RON mode pre-selected

## Implementation Notes

1. The mockup uses existing UI components:
   - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
   - `Button` component
   - `Separator` component
   - `Link` component from Next.js

2. Required icons:
   - `ComputerIcon` for the service icon
   - `CheckIcon` for the included features
   - `PlusCircleIcon` for the add-ons

3. Positioning:
   - This card should be positioned as the 4th card in the comparison section
   - It should maintain the same height as other cards for visual consistency

4. Responsive Behavior:
   - On mobile, cards stack vertically
   - On tablet and up, they display in a grid
   - Typography and spacing remain proportional at all breakpoints