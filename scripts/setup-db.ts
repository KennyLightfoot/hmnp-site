import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Starting database setup...")

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "password123"

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await hash(adminPassword, 10)

      await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Admin User",
          password: hashedPassword,
          role: "ADMIN",
        },
      })

      console.log(`Admin user created with email: ${adminEmail}`)
    } else {
      console.log("Admin user already exists")
    }

    // Create sample testimonials
    const testimonialCount = await prisma.testimonial.count()

    if (testimonialCount === 0) {
      await prisma.testimonial.createMany({
        data: [
          {
            name: "Sarah Johnson",
            location: "Houston, TX",
            service: "Essential Mobile Package",
            rating: 5,
            date: new Date("2023-06-15"),
            content:
              "I needed a notary for my power of attorney documents and Houston Mobile Notary Pros made it so easy. The notary arrived on time, was professional, and efficiently handled all my documents. I highly recommend their services!",
            featured: true,
            approved: true,
          },
          {
            name: "Michael Rodriguez",
            location: "Pearland, TX",
            service: "Loan Signing Service",
            rating: 5,
            date: new Date("2023-07-03"),
            content:
              "Our loan signing went smoothly thanks to the professional service provided. The notary explained everything clearly and made sure all documents were properly executed. The process was much less stressful than I anticipated!",
            featured: false,
            approved: true,
          },
          {
            name: "Jennifer Williams",
            location: "Sugar Land, TX",
            service: "Priority Service Package",
            rating: 4.5,
            date: new Date("2023-05-22"),
            content:
              "I needed a notary urgently for some time-sensitive documents. I called in the morning and they had someone at my office by lunchtime. The service was prompt and professional. Would definitely use again!",
            featured: false,
            approved: true,
          },
        ],
      })

      console.log("Sample testimonials created")
    } else {
      console.log("Testimonials already exist")
    }

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
