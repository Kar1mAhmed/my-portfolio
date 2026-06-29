"use client";

import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      type="button"
      className="carousel-card"
      onClick={onClick}
    >
      {/* Cover Image Frame */}
      <div className="carousel-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverImageUrl}
          alt={project.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      {/* Project Title directly below */}
      <span className="carousel-title">
        {project.name}
      </span>
    </button>
  );
}
