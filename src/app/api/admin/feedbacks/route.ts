import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySession } from "@/lib/auth";
import { getFeedbacks, saveFeedbacks } from "@/lib/kv";
import type { Feedback } from "@/types/project";

async function isAuthorized(env: any): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("portfolio_session")?.value || null;
  const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";
  const username = await verifySession(token, secret);
  return !!username;
}

// GET - Get all feedbacks
export async function GET() {
  const feedbacks = await getFeedbacks();
  return NextResponse.json(feedbacks);
}

// POST - Add new feedback
export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const newFeedback = (await request.json()) as Feedback;
    if (!newFeedback.id) {
      newFeedback.id = `feedback-${crypto.randomUUID()}`;
    }

    const currentFeedbacks = await getFeedbacks();
    currentFeedbacks.push(newFeedback);
    await saveFeedbacks(currentFeedbacks);

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error("Add Feedback Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update existing feedback
export async function PUT(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updatedFeedback = (await request.json()) as Feedback;
    if (!updatedFeedback.id) {
      return NextResponse.json({ success: false, error: "Feedback ID is required" }, { status: 400 });
    }

    const currentFeedbacks = await getFeedbacks();
    const index = currentFeedbacks.findIndex((f) => f.id === updatedFeedback.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Feedback not found" }, { status: 404 });
    }

    currentFeedbacks[index] = { ...currentFeedbacks[index], ...updatedFeedback };
    await saveFeedbacks(currentFeedbacks);

    return NextResponse.json({ success: true, feedback: updatedFeedback });
  } catch (error) {
    console.error("Update Feedback Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove feedback
export async function DELETE(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Feedback ID is required" }, { status: 400 });
    }

    const currentFeedbacks = await getFeedbacks();
    const updatedFeedbacks = currentFeedbacks.filter((f) => f.id !== id);

    if (currentFeedbacks.length === updatedFeedbacks.length) {
      return NextResponse.json({ success: false, error: "Feedback not found" }, { status: 404 });
    }

    await saveFeedbacks(updatedFeedbacks);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Feedback Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
