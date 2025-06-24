import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>You're Offline</CardTitle>
          <CardDescription>
            It looks like you're not connected to the internet. Some features may not be available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>What you can still do:</p>
            <ul className="mt-2 space-y-1 text-left list-disc list-inside">
              <li>View your past bookings</li>
              <li>Access your dashboard</li>
              <li>Review booking details</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Changes made offline will sync when you're back online.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 