const EXPERIENCES = [
  {
    title: "Freelance Full-Stack Developer",
    company: "Independent, remote (Upwork & direct clients)",
    date: "2024 — Present",
    stack: [
      "Next.js",
      "Django",
      "FastAPI",
      "Cloudflare Workers/D1/KV/R2",
      "PostgreSQL",
      "Stripe",
    ],
    bullets: [
      "Went independent to work directly with clients on SaaS platforms, mobile apps, and marketing sites, taking full responsibility for each project from planning to launch.",
      "Built SceneYard, a subscription SaaS platform for motion designers. Planned the stack and built the full product, now at 20,000+ signups and 300+ indexed pages.",
      "Built Castform, an AI voice agent SaaS platform, owning the architecture and full-stack development.",
      "Built the backend for My Story, a mobile app published on Google Play.",
      "Delivered marketing and corporate websites for clients across Egypt, Iraq, and the wider Middle East, including EMAAL Business Space, Aldamen United, and Al Saif Law Firm, Iraq's oldest law firm.",
      "Comfortable taking full ownership of a project: architecture, build, launch, and staying involved afterward to track performance and growth.",
    ],
  },
  {
    title: "Full-Stack Developer",
    company: "Senu Studio — creative agency",
    date: "Earlier",
    stack: [],
    bullets: [
      "Worked as a full-stack developer at Senu Studio, a creative agency building sites for marketing and business clients.",
      "Built and shipped 25+ marketing websites, most running on custom CMS setups so clients could manage their own content without touching code.",
      "Added advanced features tailored to each client: dynamic portfolio systems, lead capture flows, booking systems, and custom admin dashboards.",
      "Built senu.studio itself, the agency's own site, which has grown to 2M+ visits.",
      "Owned each project end to end: frontend, backend, deployment, and SEO, working directly with clients from the first call to launch.",
    ],
  },
];

export default function WorkExperience() {
  return (
    <section className="work-section">
      <div className="section-header">
        <span className="overline">Experience</span>
        <h2 className="section-title">Work Experience</h2>
      </div>

      <div className="work-timeline">
        {EXPERIENCES.map((exp) => (
          <div key={exp.title} className="work-card">
            <div className="work-marker" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>

            <div className="work-body">
              <div className="work-header">
                <div>
                  <h3 className="work-title">{exp.title}</h3>
                  <p className="work-company">{exp.company}</p>
                </div>
                <span className="work-date">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {exp.date}
                </span>
              </div>

              {exp.stack.length > 0 && (
                <div className="work-stack">
                  {exp.stack.map((tech) => (
                    <span key={tech} className="tech-pill">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <ul className="work-list">
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
