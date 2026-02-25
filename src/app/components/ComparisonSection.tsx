import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Check, X, Scale } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

export function ComparisonSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const comparisons = [
    { feature: t.comparison.row1Feature, old: t.comparison.row1Old, new: t.comparison.row1New },
    { feature: t.comparison.row2Feature, old: t.comparison.row2Old, new: t.comparison.row2New },
    { feature: t.comparison.row3Feature, old: t.comparison.row3Old, new: t.comparison.row3New },
    { feature: t.comparison.row4Feature, old: t.comparison.row4Old, new: t.comparison.row4New },
    { feature: t.comparison.row5Feature, old: t.comparison.row5Old, new: t.comparison.row5New },
    { feature: t.comparison.row6Feature, old: t.comparison.row6Old, new: t.comparison.row6New },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "#0A0F1E" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Scale className="w-6 h-6" style={{ color: "#00F2FF" }} />
            <span
              style={{
                color: "#00F2FF",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {t.comparison.label}
            </span>
          </div>

          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            {t.comparison.titleBefore}
            <span
              style={{
                background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.comparison.titleHighlight}
            </span>
          </h2>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-3 gap-4 px-6 py-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {t.comparison.columnFeature}
            </div>
            <div
              className="text-center"
              style={{
                color: "rgba(255,255,255,0.3)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {t.comparison.columnOld}
            </div>
            <div
              className="text-center"
              style={{
                color: "#00F2FF",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {t.comparison.columnNew}
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="grid grid-cols-3 gap-4 px-6 py-4 items-center"
              style={{
                borderBottom:
                  i < comparisons.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {row.feature}
              </div>

              {/* Old */}
              <div className="text-center flex items-center justify-center gap-2">
                <X className="w-4 h-4 shrink-0" style={{ color: "#FF6B6B" }} />
                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8125rem",
                    fontWeight: 400,
                  }}
                >
                  {row.old}
                </span>
              </div>

              {/* New */}
              <div className="text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 shrink-0" style={{ color: "#CCFF00" }} />
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {row.new}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
