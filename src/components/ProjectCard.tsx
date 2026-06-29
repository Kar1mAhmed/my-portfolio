"use client";

import Image from "next/image";
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
        <Image
          src={project.coverImageUrl}
          alt={project.name}
          fill
          sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
          priority
        />
      </div>

      {/* Project Title directly below */}
      <span className="carousel-title">
        {project.name}
      </span>
    </button>
  );
}
