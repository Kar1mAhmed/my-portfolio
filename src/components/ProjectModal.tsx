"use client";

import { useEffect, useRef, useCallback } from "react";

import TechIcon from "./TechIcon";
import StatusBadge from "./StatusBadge";
import type { Project } from "@/types/project";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const fmtDate = (d: string) => {
    const [y, m] = d.split("-");
    return new Date(+y, +m - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
    >
      <div className="modal-box">

        {/* Sticky header */}
        <div className="modal-header" style={{
          position: "sticky", top: 0, zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.25rem",
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)" }}>
              {project.name}
            </span>
            <StatusBadge status={project.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 7,
              border: "1px solid var(--border)", background: "var(--bg-hover)",
              color: "var(--text-3)", cursor: "pointer",
              transition: "all 150ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--border-md)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
            {/* Meta grid */}
            <div className="modal-meta">
              {[
                { label: "Role",      value: project.role },
                { label: "Dev Time",  value: project.devTime },
                { label: "Period",    value: `${fmtDate(project.startDate)} – ${project.endDate ? fmtDate(project.endDate) : "Now"}` },
              ].map(({ label, value }) => (
                <div key={label} className="modal-meta-item">
                  <span className="modal-meta-label">{label}</span>
                  <span className="modal-meta-value">{value}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="modal-tags">
                {project.tags.map((t) => <span key={t} className="badge badge-tag">{t}</span>)}
              </div>
            )}

            {/* About */}
            <div className="modal-section">
              <span className="modal-section-label">About</span>
              <p className="modal-desc">{project.description}</p>
            </div>

            {/* Tech Stack */}
            <div className="modal-section">
              <span className="modal-section-label">Tech Stack</span>
              <div className="modal-tech">
                {project.techStack.map((t) => <TechIcon key={t} name={t} />)}
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary modal-cta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Visit Live Site
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  View Source
                </a>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
