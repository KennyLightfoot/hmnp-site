import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { Role } from "@/lib/prisma-types"; // Import your Role enum

// Extend the default JWT interface
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role; // Use the imported Role enum
  }
}

// Extend the default Session interface
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role; // Use the imported Role enum
    } & DefaultSession["user"]; // Keep the default properties like name, email, image
  }

  // Optionally, extend the User type if you add properties directly to the user object passed to jwt callback
  // interface User extends DefaultUser {
  //   role: Role;
  // }
} 