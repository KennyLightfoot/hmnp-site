import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface GoHighLevelProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  companyName: string;
  locationId?: string;
}

export default function GoHighLevelProvider<P extends GoHighLevelProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    id: "gohighlevel",
    name: "GoHighLevel",
    type: "oauth",
    authorization: {
      url: "https://marketplace.gohighlevel.com/oauth/chooselocation",
      params: {
        scope: "contacts.readonly contacts.write locations.readonly locations.write calendars.readonly calendars.write calendars/events.readonly calendars/events.write",
        response_type: "code",
        redirect_uri: `${baseUrl}/api/auth/callback/oauth`,
        client_id: process.env.GHL_CLIENT_ID,
      },
    },
    token: {
      url: "https://services.leadconnectorhq.com/oauth/token",
      params: {
        grant_type: "authorization_code",
        client_id: process.env.GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/callback/oauth`,
      },
    },
    userinfo: {
      url: "https://services.leadconnectorhq.com/oauth/userinfo",
    },
    profile(profile: any) {
      return {
        id: profile.sub || profile.id,
        email: profile.email,
        firstName: profile.given_name || profile.firstName,
        lastName: profile.family_name || profile.lastName,
        companyId: profile.company_id || profile.companyId,
        companyName: profile.company_name || profile.companyName,
        locationId: profile.location_id || profile.locationId,
      };
    },
    ...options,
  };
} 