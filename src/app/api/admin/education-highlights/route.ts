import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySession } from "@/lib/auth";
import { getEducationHighlights, saveEducationHighlights } from "@/lib/kv";
import type { EducationHighlight } from "@/types/project";

async function isAuthorized(env: any): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("portfolio_session")?.value || null;
  const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";
  const username = await verifySession(token, secret);
  return !!username;
}

// GET - Get all education highlights
export async function GET() {
  const highlights = await getEducationHighlights();
  return NextResponse.json(highlights);
}

// POST - Add new highlight
export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const newHighlight = (await request.json()) as EducationHighlight;
    if (!newHighlight.id) {
      newHighlight.id = `edu-${crypto.randomUUID()}`;
    }

    const currentHighlights = await getEducationHighlights();
    currentHighlights.push(newHighlight);
    await saveEducationHighlights(currentHighlights);

    return NextResponse.json({ success: true, highlight: newHighlight });
  } catch (error) {
    console.error("Add Education Highlight Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update existing highlight
export async function PUT(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updatedHighlight = (await request.json()) as EducationHighlight;
    if (!updatedHighlight.id) {
      return NextResponse.json({ success: false, error: "Highlight ID is required" }, { status: 400 });
    }

    const currentHighlights = await getEducationHighlights();
    const index = currentHighlights.findIndex((h) => h.id === updatedHighlight.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Highlight not found" }, { status: 404 });
    }

    currentHighlights[index] = { ...currentHighlights[index], ...updatedHighlight };
    await saveEducationHighlights(currentHighlights);

    return NextResponse.json({ success: true, highlight: updatedHighlight });
  } catch (error) {
    console.error("Update Education Highlight Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove highlight
export async function DELETE(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Highlight ID is required" }, { status: 400 });
    }

    const currentHighlights = await getEducationHighlights();
    const updatedHighlights = currentHighlights.filter((h) => h.id !== id);

    if (currentHighlights.length === updatedHighlights.length) {
      return NextResponse.json({ success: false, error: "Highlight not found" }, { status: 404 });
    }

    await saveEducationHighlights(updatedHighlights);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Education Highlight Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
