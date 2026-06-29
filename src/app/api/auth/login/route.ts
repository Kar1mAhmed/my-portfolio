import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const { username, password } = (await request.json()) as any;

    const expectedUsername = env.ADMIN_USERNAME || "admin";
    const expectedPassword = env.ADMIN_PASSWORD || "secure_admin_password_2026";
    const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";

    if (username === expectedUsername && password === expectedPassword) {
      const sessionToken = await createSession(username, secret);
      
      const response = NextResponse.json({ success: true });
      response.headers.set(
        "Set-Cookie",
        `portfolio_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
      );
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
