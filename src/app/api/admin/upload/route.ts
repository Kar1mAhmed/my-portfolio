import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("portfolio_session")?.value || null;
    const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";

    const username = await verifySession(token, secret);
    if (!username) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Get file extension or default to webp
    const ext = file.name.split(".").pop() || "webp";
    const filename = `${crypto.randomUUID()}.${ext}`;

    if (!env.my_bucket) {
      console.warn("R2 bucket 'my_bucket' binding is missing. Using local mock URL.");
      return NextResponse.json({
        success: true,
        url: `/Images/My-Image.jpeg`,
      });
    }

    await env.my_bucket.put(filename, buffer, {
      httpMetadata: {
        contentType: file.type || "image/webp",
      },
    });

    return NextResponse.json({
      success: true,
      url: `/api/images/${filename}`,
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
