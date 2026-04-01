"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const smoothX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.2 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.2 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 120);
      y.set(event.clientY - 120);
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(133,173,255,0.14),rgba(133,173,255,0))] blur-3xl md:block"
      style={{ x: smoothX, y: smoothY }}
    />
  );
}
