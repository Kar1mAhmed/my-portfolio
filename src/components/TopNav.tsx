"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#feedbacks", label: "Testimonials" },
  { href: "#education", label: "Learning" },
];

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Scrollspy: highlight the section whose top is nearest the active marker
    const ids = LINKS.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const markerRatio = 0.25;
    const update = () => {
      const marker = window.scrollY + window.innerHeight * markerRatio;
      let current = "";
      for (const section of sections) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) {
          current = `#${section.id}`;
        }
      }
      setActiveHash(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const closeAndGo = (href: string) => {
    setOpen(false);
    setActiveHash(href);
    // Give the mobile menu time to unmount before scrolling
    requestAnimationFrame(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <header className={`top-nav ${scrolled ? "top-nav--scrolled" : ""}`}>
      <div className="top-nav-inner">
        <a
          href="#home"
          className="top-nav-brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Home"
        >
          <span className="top-nav-logo" aria-hidden>
            <img src="/favicon.ico" alt="" width="28" height="28" />
          </span>
          <span className="top-nav-brand-name">Karim Ahmed</span>
        </a>

        <nav className="top-nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`top-nav-link ${activeHash === link.href ? "is-active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                closeAndGo(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="top-nav-actions">
          <a href="mailto:" className="top-nav-cta top-nav-cta--desktop" onClick={(e) => {
            // Rewrite to real email dynamically if present in DOM
            const emailLink = document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]:not(.top-nav-cta)');
            if (emailLink) {
              e.preventDefault();
              window.location.href = emailLink.href;
            }
          }}>
            <span className="top-nav-cta-dot" aria-hidden />
            Get in touch
          </a>

          <button
            type="button"
            className="top-nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`burger-bar ${open ? "burger-bar--x1" : ""}`} />
            <span className={`burger-bar ${open ? "burger-bar--hide" : ""}`} />
            <span className={`burger-bar ${open ? "burger-bar--x2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div className={`top-nav-mobile ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="top-nav-mobile-inner">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`top-nav-mobile-link ${activeHash === link.href ? "is-active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                closeAndGo(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="mailto:"
            className="top-nav-cta top-nav-cta--mobile"
            onClick={(e) => {
              const emailLink = document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]:not(.top-nav-cta)');
              if (emailLink) {
                e.preventDefault();
                window.location.href = emailLink.href;
              }
              setOpen(false);
            }}
          >
            <span className="top-nav-cta-dot" aria-hidden />
            Get in touch
          </a>
        </div>
      </div>
    </header>
  );
}
