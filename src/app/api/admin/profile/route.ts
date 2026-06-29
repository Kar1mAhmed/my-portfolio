import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySession } from "@/lib/auth";
import { getProfile, saveProfile } from "@/lib/kv";
import type { Profile } from "@/types/project";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("portfolio_session")?.value || null;
    const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";

    const username = await verifySession(token, secret);
    if (!username) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updatedProfile = (await request.json()) as Profile;
    await saveProfile(updatedProfile);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Save Profile Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
