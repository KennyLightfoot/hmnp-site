import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const url = new URL(req.url);
	const toggle = url.searchParams.get("redesign");
	if (toggle === "1" || toggle === "0") {
		const res = NextResponse.next();
		res.cookies.set("hmnp_redesign_v1", toggle, { path: "/", httpOnly: false, sameSite: "Lax" });
		return res;
	}
	return NextResponse.next();
}


