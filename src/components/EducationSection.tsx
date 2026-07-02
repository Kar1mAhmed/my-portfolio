import type { EducationHighlight } from "@/types/project";

interface EducationSectionProps {
  highlights: EducationHighlight[];
}

const TYPE_LABELS: Record<EducationHighlight["type"], string> = {
  course: "Course",
  book: "Book",
  certificate: "Certificate",
};

export default function EducationSection({ highlights }: EducationSectionProps) {
  return (
    <section className="education-section">
      <div className="section-header">
        <span className="overline">Education</span>
        <h2 className="section-title">Learning Path</h2>
      </div>

      <div className="education-timeline">
        {/* Main degree */}
        <div className="education-card">
          <div className="education-marker">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div className="education-body">
            <div className="education-header">
              <div>
                <h3 className="education-degree">B.Sc. Computer &amp; Information Science</h3>
                <div className="education-school">Mansoura University</div>
              </div>
              <span className="education-year">2020 – 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic highlights */}
      {highlights.length > 0 && (
        <div className="education-highlights">
          <h4 className="education-highlights-title">Courses, Books &amp; Certificates</h4>
          <div className="education-highlights-grid">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="education-highlight-card">
                <div className="education-highlight-top">
                  <span className={`badge badge-${highlight.type}`}>{TYPE_LABELS[highlight.type]}</span>
                  {highlight.year && <span className="education-highlight-year">{highlight.year}</span>}
                </div>

                {highlight.url ? (
                  <a
                    href={highlight.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="education-highlight-title"
                  >
                    {highlight.title}
                  </a>
                ) : (
                  <span className="education-highlight-title">{highlight.title}</span>
                )}

                {highlight.subtitle && <span className="education-highlight-subtitle">{highlight.subtitle}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
