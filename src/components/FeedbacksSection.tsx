"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Feedback } from "@/types/project";

interface FeedbacksSectionProps {
  feedbacks: Feedback[];
}

export default function FeedbacksSection({ feedbacks }: FeedbacksSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      if (!setRef.current || !trackRef.current || !innerRef.current) return;
      const setWidth = setRef.current.scrollWidth;
      const trackWidth = trackRef.current.clientWidth;
      const copiesNeeded = Math.max(1, Math.ceil(trackWidth / setWidth));
      // Shift by exactly one set width so the loop is seamless when it resets
      innerRef.current.style.setProperty("--marquee-shift", `${setWidth}px`);
      innerRef.current.style.setProperty("--marquee-duration", `${setWidth / 60}s`);
      setCopies(copiesNeeded + 1);
      setReady(true);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [feedbacks.length]);

  if (feedbacks.length === 0) {
    return null;
  }

  const renderCard = (feedback: Feedback) => (
    <div key={feedback.id} className="feedback-card">
      <div className="feedback-quote">“{feedback.feedback}”</div>

      <div className="feedback-footer">
        <div className="feedback-meta">
          <div className="feedback-client">{feedback.clientName}</div>
          {feedback.clientRole && <div className="feedback-role">{feedback.clientRole}</div>}
          {feedback.projectUrl ? (
            <a
              href={feedback.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="feedback-project"
              onClick={(e) => e.stopPropagation()}
            >
              {feedback.projectName}
            </a>
          ) : (
            <span className="feedback-project-plain">{feedback.projectName}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="feedbacks-section">
      <div className="section-header">
        <span className="overline">Testimonials</span>
        <h2 className="section-title">Client Feedbacks</h2>
      </div>

      <div className="feedback-track" ref={trackRef}>
        {/* Hidden measurement copy — one full set */}
        <div className="feedback-measure" ref={setRef}>
          {feedbacks.map((feedback) => renderCard(feedback))}
        </div>

        {/* Animated inner — duplicated sets for seamless loop */}
        <div
          className="feedback-inner"
          ref={innerRef}
          style={{
            opacity: ready ? 1 : 0,
            animationPlayState: ready ? "running" : "paused",
          }}
        >
          {Array.from({ length: copies }).map((_, copyIndex) => (
            <div key={copyIndex} className="feedback-set" aria-hidden={copyIndex > 0}>
              {feedbacks.map((feedback) =>
                renderCard({ ...feedback, id: `${feedback.id}-copy-${copyIndex}` })
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
