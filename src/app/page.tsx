import { getProfile, getProjects, getFeedbacks, getEducationHighlights } from "@/lib/kv";
import ProfileSection from "@/components/ProfileSection";
import ProjectGrid from "@/components/ProjectGrid";
import FeedbacksSection from "@/components/FeedbacksSection";
import WorkExperience from "@/components/WorkExperience";
import EducationSection from "@/components/EducationSection";
import Reveal from "@/components/Reveal";

export default async function Home() {
  const [profile, projects, feedbacks, educationHighlights] = await Promise.all([
    getProfile(),
    getProjects(),
    getFeedbacks(),
    getEducationHighlights(),
  ]);

  return (
    <div className="page-wrap">
      <div id="home">
        <ProfileSection profile={profile} />
      </div>
      <div className="divider" />
      <Reveal id="work">
        <ProjectGrid projects={projects} />
      </Reveal>
      {feedbacks.length > 0 && (
        <>
          <div className="divider" />
          <Reveal id="feedbacks">
            <FeedbacksSection feedbacks={feedbacks} />
          </Reveal>
        </>
      )}
      <div className="divider" />
      <Reveal id="experience">
        <WorkExperience />
      </Reveal>
      <div className="divider" />
      <Reveal id="education">
        <EducationSection highlights={educationHighlights} />
      </Reveal>
    </div>
  );
}
