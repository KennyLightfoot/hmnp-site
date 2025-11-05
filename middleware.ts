import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const url = new URL(req.url);
	const preview = process.env.PREVIEW_UI_ONLY === '1'

	// In UI preview, disable most API routes to avoid backend imports (e.g., Prisma)
	if (preview && url.pathname.startsWith('/api/') && url.pathname !== '/api/availability') {
		return new Response(JSON.stringify({ error: 'This API is disabled in preview mode.' }), {
			status: 503,
			headers: { 'content-type': 'application/json' }
		});
	}
	const toggle = url.searchParams.get("redesign");
	if (toggle === "1" || toggle === "0") {
		const res = NextResponse.next();
		res.cookies.set("hmnp_redesign_v1", toggle, { path: "/", httpOnly: false, sameSite: "Lax" });
		return res;
	}
	return NextResponse.next();
}


