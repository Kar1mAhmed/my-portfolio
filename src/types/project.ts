export interface Project {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  devTime: string;
  startDate: string;
  endDate?: string;
  status: "live" | "in-progress" | "archived";
  tags: string[];
  role: string;
}

export interface Profile {
  name: string;
  jobTitle: string;
  bio: string;
  location: string;
  email: string;
  avatarUrl: string;
  resumeUrl: string;
  availabilityStatus: "open" | "busy" | "not-looking";
  socials: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    x?: string;
  };
}
