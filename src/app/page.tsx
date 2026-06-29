import { getProfile, getProjects } from "@/lib/kv";
import ProfileSection from "@/components/ProfileSection";
import ProjectGrid from "@/components/ProjectGrid";

export default async function Home() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);

  return (
    <div className="page-wrap">
      <ProfileSection profile={profile} />
      <div className="divider" />
      <ProjectGrid projects={projects} />
    </div>
  );
}
