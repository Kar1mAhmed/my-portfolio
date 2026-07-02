import { getProfile, getProjects, getFeedbacks, getEducationHighlights } from "@/lib/kv";
import ProfileSection from "@/components/ProfileSection";
import ProjectGrid from "@/components/ProjectGrid";
import FeedbacksSection from "@/components/FeedbacksSection";
import WorkExperience from "@/components/WorkExperience";
import EducationSection from "@/components/EducationSection";

export default async function Home() {
  const [profile, projects, feedbacks, educationHighlights] = await Promise.all([
    getProfile(),
    getProjects(),
    getFeedbacks(),
    getEducationHighlights(),
  ]);

  return (
    <div className="page-wrap">
      <ProfileSection profile={profile} />
      <div className="divider" />
      <ProjectGrid projects={projects} />
      {feedbacks.length > 0 && (
        <>
          <div className="divider" />
          <FeedbacksSection feedbacks={feedbacks} />
        </>
      )}
      <div className="divider" />
      <WorkExperience />
      <div className="divider" />
      <EducationSection highlights={educationHighlights} />
    </div>
  );
}
