import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Project, Profile, Feedback, EducationHighlight } from "@/types/project";

// ─── Mock Data (for local dev / when KV is empty) ───────────────────────────

const MOCK_PROFILE: Profile = {
  name: "Karim Ahmed",
  jobTitle: "Build Websites That Make Sales",
  bio: "I've worked on 50+ websites — analyzing traffic, testing, and iterating until the numbers moved. Some hit thousands of daily visitors and hundreds of paying subscribers. I know what makes people buy. Not just making sites look good — making them work.",
  location: "Cairo, Egypt",
  email: "karim.was.in@gmail.com",
  phone: "+20 106 202 4268",
  avatarUrl: "/Images/My-Image.jpeg",
  resumeUrl: "/Karim-Ahmed-CV.pdf",
  availabilityStatus: "open",
  socials: {
    linkedin: "https://linkedin.com/in/karimahmed",
    github: "https://github.com/Kar1mAhmed",
    instagram: "https://instagram.com/kar1m.ahmed",
  },
};

const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: "feedback-1",
    clientName: "Sarah Mitchell",
    clientRole: "Founder, LaunchPad Studio",
    clientImageUrl: "/Images/My-Image.jpeg",
    feedback:
      "Karim built our landing page and the conversion rate doubled within the first month. He thinks about the business outcome, not just the pixels.",
    projectName: "LaunchPad Studio",
    projectUrl: "https://example.com",
  },
  {
    id: "feedback-2",
    clientName: "Omar Hassan",
    clientRole: "Product Lead, FinTrack",
    clientImageUrl: "/Images/My-Image.jpeg",
    feedback:
      "Fast, reliable, and genuinely understands product. The dashboard he shipped became the most used feature in our app.",
    projectName: "FinTrack",
    projectUrl: "https://example.com",
  },
  {
    id: "feedback-3",
    clientName: "Emily Chen",
    clientRole: "CTO, Cloud Dashboard",
    clientImageUrl: "/Images/My-Image.jpeg",
    feedback:
      "Working with Karim felt like having an extra senior engineer on the team. Clean architecture, great communication, and he always hits deadlines.",
    projectName: "Cloud Dashboard",
    projectUrl: "https://example.com",
  },
];

const MOCK_EDUCATION_HIGHLIGHTS: EducationHighlight[] = [
  {
    id: "edu-1",
    title: "AWS Cloud Practitioner",
    subtitle: "Amazon Web Services",
    type: "certificate",
    url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    year: "2024",
  },
  {
    id: "edu-2",
    title: "Clean Code",
    subtitle: "Robert C. Martin",
    type: "book",
    year: "2023",
  },
  {
    id: "edu-3",
    title: "Meta Front-End Developer Professional Certificate",
    subtitle: "Coursera",
    type: "course",
    url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
    year: "2023",
  },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: "cloud-dashboard",
    name: "Cloud Dashboard",
    description:
      "A real-time infrastructure monitoring dashboard built for cloud-native teams. Features live metrics, alerting, and multi-region support with sub-second latency.",
    coverImageUrl: "/projects/project-1.jpg",
    techStack: ["Next.js", "TypeScript", "Cloudflare Workers", "Tailwind CSS", "D3.js"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/cloud-dashboard",
    devTime: "6 weeks",
    startDate: "2026-01",
    endDate: "2026-03",
    status: "live",
    tags: ["SaaS", "DevOps"],
    role: "Full-Stack Developer",
  },
  {
    id: "ai-content-studio",
    name: "AI Content Studio",
    description:
      "An AI-powered content creation platform that helps teams generate, edit, and publish marketing copy at scale. Integrates with popular CMS platforms.",
    coverImageUrl: "/projects/project-2.jpg",
    techStack: ["React", "Node.js", "PostgreSQL", "OpenAI", "Tailwind CSS"],
    liveUrl: "https://example.com",
    devTime: "3 months",
    startDate: "2025-09",
    endDate: "2025-12",
    status: "live",
    tags: ["AI", "SaaS"],
    role: "Frontend Lead",
  },
  {
    id: "devflow",
    name: "DevFlow CLI",
    description:
      "An open-source CLI tool that automates development workflows — from project scaffolding to CI/CD pipeline generation. Supports multiple frameworks and cloud providers.",
    coverImageUrl: "/projects/project-3.jpg",
    techStack: ["Node.js", "TypeScript", "Cloudflare"],
    githubUrl: "https://github.com/example/devflow",
    devTime: "4 weeks",
    startDate: "2026-04",
    status: "in-progress",
    tags: ["Open Source", "Developer Tools"],
    role: "Creator & Maintainer",
  },
  {
    id: "fintrack",
    name: "FinTrack",
    description:
      "A personal finance tracker with bank integrations, spending analytics, and budget goal tracking. Built with privacy-first architecture — all data stays on-device.",
    coverImageUrl: "/projects/project-4.jpg",
    techStack: ["Next.js", "React", "SQLite", "Tailwind CSS"],
    liveUrl: "https://example.com",
    devTime: "8 weeks",
    startDate: "2025-05",
    endDate: "2025-07",
    status: "archived",
    tags: ["Fintech", "Mobile"],
    role: "Full-Stack Developer",
  },
  {
    id: "pixel-engine",
    name: "Pixel Engine",
    description:
      "A lightweight 2D game engine for the web. Supports sprite animations, physics, and tile-based maps. Designed for indie game developers and creative coding.",
    coverImageUrl: "/projects/project-5.jpg",
    techStack: ["TypeScript", "WebGL", "Node.js"],
    githubUrl: "https://github.com/example/pixel-engine",
    liveUrl: "https://example.com",
    devTime: "3 months",
    startDate: "2025-01",
    endDate: "2025-04",
    status: "live",
    tags: ["Open Source", "Game Dev"],
    role: "Creator",
  },
  {
    id: "hirelink",
    name: "HireLink",
    description:
      "A job board platform connecting tech talent with startups. Features smart matching, async video interviews, and cultural-fit scoring.",
    coverImageUrl: "/projects/project-6.jpg",
    techStack: ["Next.js", "PostgreSQL", "Cloudflare Workers", "React"],
    liveUrl: "https://example.com",
    devTime: "10 weeks",
    startDate: "2024-11",
    endDate: "2025-02",
    status: "live",
    tags: ["SaaS", "HR Tech"],
    role: "Co-Founder & Developer",
  },
];

// ─── KV Fetchers ─────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile> {
  try {
    const { env } = await getCloudflareContext();
    const raw = await env.MY_KV.get("profile");
    if (raw) return JSON.parse(raw) as Profile;
  } catch {
    // Fallback to mock in local dev
  }
  return MOCK_PROFILE;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const { env } = await getCloudflareContext();
    const raw = await env.MY_KV.get("projects");
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    // Fallback to mock in local dev
  }
  return MOCK_PROJECTS;
}

export async function getFeedbacks(): Promise<Feedback[]> {
  try {
    const { env } = await getCloudflareContext();
    const raw = await env.MY_KV.get("feedbacks");
    if (raw) return JSON.parse(raw) as Feedback[];
  } catch {
    // Fallback to mock in local dev
  }
  return MOCK_FEEDBACKS;
}

export async function getEducationHighlights(): Promise<EducationHighlight[]> {
  try {
    const { env } = await getCloudflareContext();
    const raw = await env.MY_KV.get("educationHighlights");
    if (raw) return JSON.parse(raw) as EducationHighlight[];
  } catch {
    // Fallback to mock in local dev
  }
  return MOCK_EDUCATION_HIGHLIGHTS;
}

export async function saveProfile(profile: Profile): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext();
    await env.MY_KV.put("profile", JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error("Failed to save profile to KV, falling back to memory:", err);
    Object.assign(MOCK_PROFILE, profile);
    return true;
  }
}

export async function saveProjects(projects: Project[]): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext();
    await env.MY_KV.put("projects", JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error("Failed to save projects to KV, falling back to memory:", err);
    MOCK_PROJECTS.length = 0;
    MOCK_PROJECTS.push(...projects);
    return true;
  }
}

export async function saveFeedbacks(feedbacks: Feedback[]): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext();
    await env.MY_KV.put("feedbacks", JSON.stringify(feedbacks));
    return true;
  } catch (err) {
    console.error("Failed to save feedbacks to KV, falling back to memory:", err);
    MOCK_FEEDBACKS.length = 0;
    MOCK_FEEDBACKS.push(...feedbacks);
    return true;
  }
}

export async function saveEducationHighlights(highlights: EducationHighlight[]): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext();
    await env.MY_KV.put("educationHighlights", JSON.stringify(highlights));
    return true;
  } catch (err) {
    console.error("Failed to save education highlights to KV, falling back to memory:", err);
    MOCK_EDUCATION_HIGHLIGHTS.length = 0;
    MOCK_EDUCATION_HIGHLIGHTS.push(...highlights);
    return true;
  }
}

