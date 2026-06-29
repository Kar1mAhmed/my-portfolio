"use client";

import { useState, useRef, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import type { Project } from "@/types/project";

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  // Determine items per page based on viewport size dynamically
  const getItemsPerPage = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  };

  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    // Set initial items per page on client side
    setItemsPerPage(getItemsPerPage());

    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  // Synchronize currentPage indicator with scroll position
  const handleScroll = () => {
    const grid = gridRef.current;
    if (!grid) return;

    const scrollLeft = grid.scrollLeft;
    const maxScroll = grid.scrollWidth - grid.clientWidth;

    // If scrolled to the end (within 15px margin), force active page to totalPages
    if (maxScroll > 0 && scrollLeft >= maxScroll - 15) {
      setCurrentPage((prev) => (prev !== totalPages ? totalPages : prev));
      return;
    }

    const children = Array.from(grid.children) as HTMLElement[];
    if (children.length === 0) return;

    // Find the first child that is mostly visible in the viewport
    const activeIndex = children.findIndex((child) => {
      return child.offsetLeft + child.clientWidth / 2 > scrollLeft;
    });

    if (activeIndex !== -1) {
      const page = Math.floor(activeIndex / itemsPerPage) + 1;
      const finalPage = Math.min(Math.max(page, 1), totalPages);
      setCurrentPage((prev) => (prev !== finalPage ? finalPage : prev));
    }
  };

  const scrollToPage = (p: number) => {
    const grid = gridRef.current;
    if (!grid) return;

    if (p === totalPages) {
      grid.scrollTo({ left: grid.scrollWidth, behavior: "smooth" });
      setCurrentPage(p);
      return;
    }

    const targetIndex = (p - 1) * itemsPerPage;
    const children = Array.from(grid.children) as HTMLElement[];
    if (children[targetIndex]) {
      const targetScrollLeft = children[targetIndex].offsetLeft;
      grid.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
      setCurrentPage(p);
    }
  };

  const handlePrevPage = () => {
    const prev = Math.max(currentPage - 1, 1);
    scrollToPage(prev);
  };

  const handleNextPage = () => {
    const next = Math.min(currentPage + 1, totalPages);
    scrollToPage(next);
  };

  return (
    <section className="projects-section" style={{ paddingBottom: "6rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", marginBottom: "2.5rem" }}>
        <div className="section-header">
          <span className="overline">Selected Work</span>
          <h2 className="section-title">Projects</h2>
        </div>
      </div>

      <div className="carousel-container">
        {/* Horizontal Card Grid (Page view with smooth overflow scroll) */}
        <div 
          className="carousel-grid" 
          ref={gridRef}
          onScroll={handleScroll}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="carousel-card-wrap"
              style={{
                scrollSnapAlign: "start",
              }}
            >
              <ProjectCard
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            </div>
          ))}
        </div>

        {/* Carousel Pagination controls */}
        {totalPages > 1 && (
          <div className="carousel-pagination">
            {/* Prev button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="pagination-btn"
              style={{ opacity: currentPage === 1 ? 0.35 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              aria-label="Previous page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => scrollToPage(p)}
                  className={`pagination-btn ${currentPage === p ? "active" : ""}`}
                  aria-label={`Page ${p}`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              style={{ opacity: currentPage === totalPages ? 0.35 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              aria-label="Next page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
}
