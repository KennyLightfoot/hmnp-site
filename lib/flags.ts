export const REDESIGN_V1 =
	(typeof window !== "undefined" && document.cookie.includes("hmnp_redesign_v1=1")) ||
	(process.env.NEXT_PUBLIC_REDESIGN_V1 ?? "").toLowerCase() === "true";


