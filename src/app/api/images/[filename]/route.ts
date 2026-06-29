import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
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

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(object.body, {
      headers,
    });
  } catch (error) {
    console.error("GET Image Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
