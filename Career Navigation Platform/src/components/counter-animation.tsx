import React, { useEffect, useRef, useState } from 'react';

interface CounterAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CounterAnimation({ end, duration = 2000, suffix = '', className = '' }: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentCount = Math.floor(progress * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isVisible, end, duration]);

  return (
    <span ref={elementRef} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
