import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySession } from "@/lib/auth";
import { getProjects, saveProjects } from "@/lib/kv";
import type { Project } from "@/types/project";

async function isAuthorized(env: any): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("portfolio_session")?.value || null;
  const secret = env.SESSION_SECRET || "default-secret-key-12345678901234567890";
  const username = await verifySession(token, secret);
  return !!username;
}

// GET - Get all projects
export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

// POST - Add new project
export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const newProject = (await request.json()) as Project;
    if (!newProject.id) {
      newProject.id = `project-${crypto.randomUUID()}`;
    }

    const currentProjects = await getProjects();
    currentProjects.push(newProject);
    await saveProjects(currentProjects);

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error("Add Project Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update existing project
export async function PUT(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updatedProject = (await request.json()) as Project;
    if (!updatedProject.id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const currentProjects = await getProjects();
    const index = currentProjects.findIndex((p) => p.id === updatedProject.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    currentProjects[index] = { ...currentProjects[index], ...updatedProject };
    await saveProjects(currentProjects);

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("Update Project Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove project
export async function DELETE(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const currentProjects = await getProjects();
    const updatedProjects = currentProjects.filter((p) => p.id !== id);

    if (currentProjects.length === updatedProjects.length) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    await saveProjects(updatedProjects);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Reorder projects
export async function PATCH(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    if (!(await isAuthorized(env))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { projectIds } = (await request.json()) as { projectIds: string[] };
    if (!Array.isArray(projectIds)) {
      return NextResponse.json({ success: false, error: "projectIds array is required" }, { status: 400 });
    }

    const currentProjects = await getProjects();
    const projectMap = new Map(currentProjects.map((p) => [p.id, p]));
    const reorderedProjects: Project[] = [];

    for (const id of projectIds) {
      const p = projectMap.get(id);
      if (p) {
        reorderedProjects.push(p);
        projectMap.delete(id);
      }
    }
    for (const p of projectMap.values()) {
      reorderedProjects.push(p);
    }

    await saveProjects(reorderedProjects);
    return NextResponse.json({ success: true, projects: reorderedProjects });
  } catch (error) {
    console.error("Reorder Projects Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

