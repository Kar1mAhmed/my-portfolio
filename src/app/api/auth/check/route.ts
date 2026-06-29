import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("portfolio_session")?.value || null;

    const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";
    const username = await verifySession(token, secret);

    if (username) {
      return NextResponse.json({ authenticated: true, username });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error("Auth Check Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
