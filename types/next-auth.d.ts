import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    profile?: any;
    expiresAt?: number;
    locationId?: string;
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: string;
    companyName: string;
    locationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    profile?: any;
    expiresAt?: number;
    locationId?: string;
  }
} 