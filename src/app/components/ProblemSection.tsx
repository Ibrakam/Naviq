import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { AlertTriangle, Users, Brain, Clock } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

export function ProblemSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const painPoints = [
    {
      icon: Users,
      title: t.problem.card1Title,
      desc: t.problem.card1Desc,
      color: "#FF6B6B",
    },
    {
      icon: Brain,
      title: t.problem.card2Title,
      desc: t.problem.card2Desc,
      color: "#FFB84D",
    },
    {
      icon: Clock,
      title: t.problem.card3Title,
      desc: t.problem.card3Desc,
      color: "#FF4D8D",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "#070B16" }}
    >
      {/* Subtle red-ish ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[150px]"
        style={{ background: "#FF4D8D" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Glitch Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6" style={{ color: "#FF6B6B" }} />
            <span
              style={{
                color: "#FF6B6B",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {t.problem.label}
            </span>
          </div>

          <div className="relative inline-block">
            <h2
              className="relative"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                color: "white",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{t.problem.titleStart}</span>
              <span
                className="relative"
                style={{
                  color: "#FF6B6B",
                  textShadow: "0 0 20px rgba(255,107,107,0.5)",
                }}
              >
                {t.problem.titleHighlight}
              </span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{t.problem.titleEnd}</span>
            </h2>
            {/* Glitch decorative lines */}
            <div
              className="absolute -left-4 top-1/2 w-1 h-12 -translate-y-1/2"
              style={{ background: "#FF6B6B", opacity: 0.6 }}
            />
          </div>

          <p
            className="mt-6 max-w-xl mx-auto"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.0625rem",
              fontWeight: 400,
              lineHeight: 1.7,
            }}
          >
            {t.problem.subtitle}
          </p>
        </motion.div>

        {/* Pain Point Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="group relative rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${point.color}33`;
                e.currentTarget.style.boxShadow = `0 0 30px ${point.color}11`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${point.color}15`,
                  border: `1px solid ${point.color}33`,
                }}
              >
                <point.icon className="w-6 h-6" style={{ color: point.color }} />
              </div>

              <h3
                className="text-white mb-3"
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                {point.title}
              </h3>

              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.9375rem",
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                {point.desc}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${point.color}66, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
