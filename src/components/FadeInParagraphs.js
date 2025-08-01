// components/FadeInParagraphs.js
import React, { useEffect, useState } from 'react';

const FadeInParagraphs = ({ paragraphs, fadeDuration = 800, paragraphDelay = 600, warningText }) => {
  const totalParagraphs = paragraphs.length + (warningText ? 1 : 0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    // Start showing the first paragraph immediately
    if (visibleCount === 0) {
      setVisibleCount(1);
      return;
    }

    // Sequentially reveal all paragraphs + warning
    if (visibleCount < totalParagraphs && !skipped) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, paragraphDelay);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, totalParagraphs, paragraphDelay, skipped]);

  const handleSkip = () => {
    setSkipped(true);
    setVisibleCount(totalParagraphs);
  };

  return (
    <div onClick={handleSkip} style={{ cursor: 'pointer' }}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity ${fadeDuration}ms ease-in, transform ${fadeDuration}ms ease-out`,
          }}
        >
          {para}
        </p>
      ))}

      {warningText && (
        <p
          className="intro-warning"
          style={{
            opacity: visibleCount > paragraphs.length ? 1 : 0,
            transform: visibleCount > paragraphs.length ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity ${fadeDuration}ms ease-in, transform ${fadeDuration}ms ease-out`,
          }}
        >
          {warningText}
        </p>
      )}

      {visibleCount < totalParagraphs && (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#aaa', marginTop: '20px' }}>
          (Click to skip)
        </p>
      )}
    </div>
  );
};

export default FadeInParagraphs;
