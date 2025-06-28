// scripts/set-admin-password.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

// --- HNIC Configuration per SOP ---
const ADMIN_EMAIL = "contact@houstonmobilenotarypros.com"
const ADMIN_PASSWORD = "Hmnp128174!"
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
    const user = await prisma.User.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (!user) {
      console.error(`Error: User with email ${ADMIN_EMAIL} not found.`)
      console.error("Please ensure the user exists in the database.")
      return
    }

    // Optional: Verify the user has the ADMIN role
    if (user.role !== Role.ADMIN) {
        console.warn(`Warning: User ${ADMIN_EMAIL} does not have the ADMIN role. Their current role is ${user.role}.`);
        console.warn("Password will be set, but they might not be able to access admin areas.")
        // You could choose to exit here if desired:
        // console.error("Exiting: User must have ADMIN role.");
        // return;
    }

    // Hash the password
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)

    // Update the user's password
    console.log(`Updating password for user ID: ${user.id}`)
    await prisma.User.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    console.log(`Successfully updated password for ${ADMIN_DISPLAY_NAME} (${ADMIN_EMAIL})`)

  } catch (error) {
    console.error("An error occurred:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 