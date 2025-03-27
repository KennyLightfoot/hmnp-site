import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PricingTable() {
  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse border border-gray-200">
        <TableHeader>
          <TableRow className="bg-secondary/20">
            <TableHead className="border border-gray-200 p-4 text-left font-bold text-accent">Service</TableHead>
            <TableHead className="border border-gray-200 p-4 text-center font-bold text-accent">Price</TableHead>
            <TableHead className="border border-gray-200 p-4 text-left font-bold text-accent">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Essential Mobile Package</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center font-medium text-primary">$75</TableCell>
            <TableCell className="border border-gray-200 p-4">
              Standard mobile notary service for 1-2 documents with up to 2 signers. Includes travel within 20 miles of
              Houston.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Priority Service</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center font-medium text-primary">$100</TableCell>
            <TableCell className="border border-gray-200 p-4">
              Same-day or urgent service with flexible scheduling, including evenings and weekends. Includes travel
              within 20 miles.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Loan Signing</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center font-medium text-primary">$150</TableCell>
            <TableCell className="border border-gray-200 p-4">
              Specialized service for mortgage closings, refinances, and other loan documents. Includes certified loan
              signing agent.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Reverse Mortgage/HELOC</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center font-medium text-primary">$150</TableCell>
            <TableCell className="border border-gray-200 p-4">
              Specialized service for reverse mortgage and home equity line of credit documents. Includes extended time
              for thorough explanation.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Specialty Services</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center font-medium text-primary">Varies</TableCell>
            <TableCell className="border border-gray-200 p-4">
              Custom notary services for unique situations, medical directives, estate planning, business formations,
              etc. Contact for pricing.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <h3 className="text-xl font-bold text-accent mt-8 mb-4">Additional Fees</h3>
      <Table className="border-collapse border border-gray-200">
        <TableHeader>
          <TableRow className="bg-secondary/20">
            <TableHead className="border border-gray-200 p-4 text-left font-bold text-accent">Item</TableHead>
            <TableHead className="border border-gray-200 p-4 text-center font-bold text-accent">Fee</TableHead>
            <TableHead className="border border-gray-200 p-4 text-left font-bold text-accent">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Additional Signers</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center">$10 per signer</TableCell>
            <TableCell className="border border-gray-200 p-4">
              For more than 2 signers (not applicable to Loan Signing services)
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Additional Documents</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center">$5 per document</TableCell>
            <TableCell className="border border-gray-200 p-4">
              For more than 2 documents (not applicable to Loan Signing services)
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Extended Travel</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center">$1.50 per mile</TableCell>
            <TableCell className="border border-gray-200 p-4">
              For locations beyond 20 miles from Houston city center
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-200 p-4 font-medium">Cancellation Fee</TableCell>
            <TableCell className="border border-gray-200 p-4 text-center">$25</TableCell>
            <TableCell className="border border-gray-200 p-4">
              For cancellations with less than 24 hours notice
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

