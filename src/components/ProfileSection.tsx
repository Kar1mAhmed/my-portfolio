"use client";

import Image from "next/image";
import SocialIcon from "./SocialIcon";
import type { Profile } from "@/types/project";
import { useLayoutEffect, useRef, useState } from "react";

interface ProfileSectionProps {
  profile: Profile;
}

const SKILLS = [
  "Next.js", "React", "TypeScript", "Node.js", "Cloudflare Workers",
  "PostgreSQL", "Tailwind CSS", "REST APIs", "WebSockets", "CI/CD",
  "Conversion UX", "Speed Optimization", "SaaS",
  "Python", "Django", "Celery", "Redis", "SQL", "KV", "S3", "R2", "Docker",
];

const MARQUEE_COPIES = 6;

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const setEl = setRef.current;
      const trackEl = trackRef.current;
      const innerEl = innerRef.current;
      if (!setEl || !trackEl || !innerEl) return;

      const setWidth = setEl.scrollWidth;
      const trackWidth = trackEl.clientWidth;
      const copiesPerLoop = Math.max(1, Math.ceil(trackWidth / setWidth));
      // +1px avoids any sub-pixel seam where the loop meets itself
      innerEl.style.setProperty("--marquee-shift", `${copiesPerLoop * setWidth + 1}px`);
      setReady(true);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section style={{ paddingTop: "5rem", paddingBottom: "4rem" }}>
      <div className="spotlight" />

      {/* ── Main split layout ───────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "4rem",
        alignItems: "start",
      }}
        className="hero-grid"
      >
        {/* Left — Statement & Positioning */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--blue-light)", letterSpacing: "-0.01em" }}>
              {profile.name} — 
              Full Stack Developer
            </span>
          </div>

          {/* Statement */}
          <h1 className="statement" style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}>
            I Build Websites That<br />
            {" "}
            <span className="statement-outline">Scale & </span>{" "}
            <span className="statement-blue">Make Sales</span>{" "}
          </h1>

          {/* Bio */}
          <p className="descriptor" style={{ fontSize: "1.0625rem", color: "var(--text-2)", maxWidth: "600px" }}>
            {profile.bio}
          </p>

          {/* Stats */}
          <div className="stat-row" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            {[
              { num: "5+",    lbl: "Years exp" },
              { num: "50+",   lbl: "Projects" },
              { num: "10+",   lbl: "Technologies" },
              { num: "100%",  lbl: "Conversions focused" },
            ].map((s) => (
              <div key={s.lbl} className="stat-cell">
                <span className="stat-num">{s.num}</span>
                <span className="stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Profile photo & Contact Info (shifted down for visual alignment) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          alignItems: "center",
          width: "100%",
          paddingTop: "3.5rem",
        }}
          className="contact-sidebar"
        >
          {/* Avatar (Smaller Circle) */}
          <div style={{
            position: "relative",
            width: 160,
            height: 160,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid var(--border-blue)",
            boxShadow: "0 0 0 4px var(--blue-dim), 0 15px 30px rgba(0,0,0,0.5), 0 0 30px var(--blue-glow)",
            flexShrink: 0,
          }}>
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              fill
              style={{ objectFit: "cover", objectPosition: "center 15%" }}
              priority
              sizes="160px"
            />
          </div>

          {/* Info Card underneath the avatar */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            width: "100%",
            textAlign: "center",
          }}>
            {/* Location */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.8125rem", color: "var(--text-3)",
              fontFamily: "var(--font-geist-mono)",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {profile.location}
            </span>

            {/* Email Link */}
            <a
              href={`mailto:${profile.email}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.8125rem", color: "var(--text-3)",
                fontFamily: "var(--font-geist-mono)", textDecoration: "none",
                transition: "color 150ms ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--blue-light)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {profile.email}
            </a>

            {/* Social Icons row */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              {profile.socials.github && (
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                  <SocialIcon platform="github" size={17} />
                </a>
              )}
              {profile.socials.linkedin && (
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                  <SocialIcon platform="linkedin" size={17} />
                </a>
              )}
              {profile.socials.x && (
                <a href={profile.socials.x} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X">
                  <SocialIcon platform="x" size={16} />
                </a>
              )}
              {profile.socials.instagram && (
                <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                  <SocialIcon platform="instagram" size={17} />
                </a>
              )}
            </div>

            {/* Actions: Download CV + Contact CTA */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              width: "100%",
              marginTop: "1rem",
            }}>
              <a href={profile.resumeUrl} download className="btn-primary" style={{ justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CV
              </a>
              
              <a href={`mailto:${profile.email}`} className="btn-ghost" style={{ justifyContent: "center" }}>
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills marquee ──────────────────────────────────────── */}
      <div style={{ marginTop: "4rem" }}>
        <div
          className="marquee-track"
          ref={trackRef}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 200ms ease" }}
        >
          <div
            className="marquee-inner"
            ref={innerRef}
            aria-hidden
          >
            {Array.from({ length: MARQUEE_COPIES }).flatMap((_, copyIndex) =>
              SKILLS.map((skill, i) => (
                <span key={`${skill}-${copyIndex}-${i}`} className="marquee-item">
                  <span className="marquee-dot" />
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Hidden measurement copy so the loop distance is exact pixels */}
        <div ref={setRef} className="marquee-measure" aria-hidden>
          {SKILLS.map((skill, i) => (
            <span key={`measure-${skill}-${i}`} className="marquee-item">
              <span className="marquee-dot" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .contact-sidebar {
            order: -1; /* Place image + info on top on mobile */
            padding-top: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
