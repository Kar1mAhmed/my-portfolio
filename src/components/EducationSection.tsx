const BOOKS = [
  { title: "Grokking Algorithms", author: "Aditya Y. Bhargava" },
  { title: "The Object-Oriented Thought Process", author: "Matt Weisfeld" },
  { title: "Head First Design Patterns", author: "Eric Freeman & Elisabeth Robson" },
  { title: "Operating Systems: Three Easy Pieces", author: "Remzi & Andrea Arpaci-Dusseau" },
  { title: "CMU Database Systems", author: "Carnegie Mellon" },
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann" },
  { title: "Clean Code", author: "Robert C. Martin" },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas" },
  { title: "Refactoring", author: "Martin Fowler" },
  { title: "System Design Interview", author: "Alex Xu" },
  { title: "Computer Networking: A Top-Down Approach", author: "Kurose & Ross" },
  { title: "Docker Deep Dive", author: "Nigel Poulton" },
];

export default function EducationSection() {
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

      {/* Reading & Learning */}
      <div className="education-reading-block">
        <h4 className="education-highlights-title">Reading &amp; Always Learning</h4>
        <p className="education-reading-body">
          I learn by building, but I also learn by reading — a lot. My shelves (and tabs) are full of system design, databases, algorithms, backend patterns, networking, and developer craft. Books that shaped how I think include{" "}
          {BOOKS.map((book, i) => (
            <span key={book.title}>
              <span className="education-reading-book">{book.title}</span> by {book.author}
              {i === BOOKS.length - 1 ? "." : i === BOOKS.length - 2 ? ", and " : ", "}
            </span>
          ))}{" "}
          On top of that, I have gone deep into Cloudflare Workers, Next.js, FastAPI, PostgreSQL, Redis, Docker, Stripe, and modern web architecture through docs, courses, and shipping real products.
        </p>
      </div>
    </section>
  );
}
