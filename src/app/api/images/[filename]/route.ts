import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { env } = await getCloudflareContext();
    const { filename } = await params;

    if (!env.my_bucket) {
      console.warn("R2 bucket 'my_bucket' binding is missing.");
      return new NextResponse("Not Found", { status: 404 });
    }

    const object = await env.my_bucket.get(filename);
    if (!object) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read the full buffer — streaming R2 body through NextResponse is unreliable
    const buffer = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType || "image/webp";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": object.httpEtag,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("GET Image Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
