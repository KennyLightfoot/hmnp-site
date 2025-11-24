// scripts/set-admin-password.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

// --- HNIC Configuration per SOP ---
// Default admin email for dashboard access
const ADMIN_EMAIL = "houstonmobilenotarypros@gmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (() => {
  console.error("ADMIN_PASSWORD environment variable is required");
  process.exit(1);
})()
const ADMIN_DISPLAY_NAME = "Houston Mobile Notary Pros" // or "HNIC" to flex
// --- End Configuration ---

async function main() {
  console.log(`Attempting to set password for HNIC admin user: ${ADMIN_DISPLAY_NAME} (${ADMIN_EMAIL})`)

  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    console.error("Error: ADMIN_PASSWORD must be at least 8 characters long.")
    return
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    // Hash the password once
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)

    if (!user) {
      console.warn(`User with email ${ADMIN_EMAIL} not found. Creating a new ADMIN user...`)
      const created = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_DISPLAY_NAME,
          role: Role.ADMIN,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      })
      console.log(`Successfully created ADMIN user ${ADMIN_DISPLAY_NAME} (${ADMIN_EMAIL}) with id ${created.id}`)
      return
    }

    // Optional: Verify the user has the ADMIN role
    if (user.role !== Role.ADMIN) {
      console.warn(`Warning: User ${ADMIN_EMAIL} does not have the ADMIN role. Their current role is ${user.role}.`)
      console.warn("Updating role to ADMIN for dashboard access.")
    }

    // Update the user's password (and ensure ADMIN role)
    console.log(`Updating password for user ID: ${user.id}`)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        role: Role.ADMIN,
      },
    })

    console.log(`Successfully updated password for ${ADMIN_DISPLAY_NAME} (${ADMIN_EMAIL})`)

  } catch (error) {
    console.error("An error occurred:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 