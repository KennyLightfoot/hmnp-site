"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ImageLogo } from "@/components/image-logo"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function MainNav() {
  const pathname = usePathname()

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

  // Resources dropdown items
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
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center">
          <ImageLogo width={50} height={50} className="py-1" />
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            {mainRoutes.map((route) => (
              <NavigationMenuItem key={route.href}>
                <Link href={route.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(navigationMenuTriggerStyle(), route.active && "text-primary font-medium")}
                  >
                    {route.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <div className="row-span-3">
                    <div className="mb-2 mt-4 text-lg font-medium">Resources</div>
                    <p className="text-sm text-muted-foreground">
                      Everything you need to know about our notary services and processes.
                    </p>
                  </div>
                  {resourceGroups.map((group, index) => (
                    <div key={group.title} className={cn("grid gap-1", index > 0 && "mt-4")}>
                      <h4 className="font-medium leading-none">{group.title}</h4>
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            pathname === item.href && "bg-accent",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">{item.label}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
        <Button asChild>
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    </div>
  )
}

