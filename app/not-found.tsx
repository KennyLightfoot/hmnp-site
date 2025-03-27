import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">404</h1>
          <h2 className="text-3xl font-semibold tracking-tight">Page Not Found</h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/services">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Our Services
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              <Search className="mr-2 h-4 w-4" />
              Contact Us
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Popular Pages</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/services/loan-signing" className="text-primary-500 hover:underline">
                Loan Signing Services
              </Link>
            </li>
            <li>
              <Link href="/services/priority-service" className="text-primary-500 hover:underline">
                Priority Mobile Notary
              </Link>
            </li>
            <li>
              <Link href="/booking" className="text-primary-500 hover:underline">
                Book an Appointment
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary-500 hover:underline">
                Frequently Asked Questions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

