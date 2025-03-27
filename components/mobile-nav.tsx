"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ImageLogo } from "@/components/image-logo"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Main navigation items
  const mainRoutes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/services",
      label: "Services",
      active: pathname === "/services" || pathname.startsWith("/services/"),
    },
    {
      href: "/pricing",
      label: "Pricing",
      active: pathname === "/pricing" || pathname === "/fee-schedule",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
  ]

  // Resources groups
  const resourceGroups = [
    {
      title: "Client Resources",
      items: [
        {
          href: "/client-guide",
          label: "Client Guide",
          description: "Essential information for working with us",
        },
        {
          href: "/document-requirements",
          label: "Document Requirements",
          description: "Required documentation for notary services",
        },
        {
          href: "/process",
          label: "Our Process",
          description: "Step-by-step guide to our services",
        },
      ],
    },
    {
      title: "Additional Information",
      items: [
        {
          href: "/service-area",
          label: "Service Area",
          description: "Areas where we provide notary services",
        },
        {
          href: "/faq",
          label: "FAQ",
          description: "Frequently asked questions",
        },
        {
          href: "/testimonials",
          label: "Testimonials",
          description: "What our clients say about us",
        },
      ],
    },
    {
      title: "Updates & News",
      items: [
        {
          href: "/blog",
          label: "Blog",
          description: "Latest updates and industry news",
        },
      ],
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[350px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <ImageLogo width={40} height={40} />
            </Link>
          </div>
        </SheetHeader>
        <nav className="flex flex-col space-y-4">
          {mainRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-base font-medium transition-colors hover:text-primary",
                route.active ? "text-primary border-l-2 border-primary pl-2" : "text-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              {route.label}
            </Link>
          ))}

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="resources">
              <AccordionTrigger>Resources</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pl-2">
                  {resourceGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">{group.title}</h4>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "block text-sm transition-colors hover:text-primary",
                              pathname === item.href ? "text-primary font-medium" : "text-foreground",
                            )}
                            onClick={() => setOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-4 space-y-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact" onClick={() => setOpen(false)}>
                Contact Us
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/booking" onClick={() => setOpen(false)}>
                Book Now
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

