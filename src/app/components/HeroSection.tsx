import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "../../i18n/LanguageContext";
import { redirectToApp } from "../../lib/appLinks";

export function HeroSection() {
  const { t } = useTranslation();

  const radarTargets = [
    { subject: t.hero.radarLogic, A: 88 },
    { subject: t.hero.radarCreative, A: 72 },
    { subject: t.hero.radarSoftSkills, A: 95 },
    { subject: t.hero.radarAnalytics, A: 80 },
    { subject: t.hero.radarLeadership, A: 65 },
    { subject: t.hero.radarTech, A: 78 },
  ];

  const [radarData, setRadarData] = useState(
    radarTargets.map((d) => ({ ...d, A: 0 }))
  );
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setRadarData(radarTargets);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setRadarData(radarTargets);
  }, [t]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{ background: "#0A0F1E" }}
    >
      {/* Ambient glow effects */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-30 blur-[120px]"
        style={{ background: "#00F2FF" }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-20 blur-[100px]"
        style={{ background: "#CCFF00" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[150px]"
        style={{ background: "radial-gradient(circle, #00F2FF, transparent)" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,242,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(0,242,255,0.08)",
                border: "1px solid rgba(0,242,255,0.2)",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#00F2FF" }} />
              <span style={{ color: "#00F2FF", fontFamily: "Inter, sans-serif", fontSize: "0.8125rem", fontWeight: 500 }}>
                {t.hero.badge}
              </span>
            </motion.div>

            <h1
              className="text-white mb-6"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {t.hero.titleLine1}{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.hero.titleHighlight}
              </span>
              <br />
              {t.hero.titleLine2}
            </h1>

            <p
              className="mb-8 max-w-lg"
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "Inter, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              {t.hero.subtitle}
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => redirectToApp("/register")}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[#0A0F1E] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  boxShadow:
                    "0 0 30px rgba(0,242,255,0.3), 0 0 60px rgba(0,242,255,0.1)",
                }}
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => redirectToApp("/login")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                <Play className="w-5 h-5" style={{ color: "#00F2FF" }} />
                {t.hero.ctaSecondary}
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[
                { value: t.hero.stat1Value, label: t.hero.stat1Label },
                { value: t.hero.stat2Value, label: t.hero.stat2Label },
                { value: t.hero.stat3Value, label: t.hero.stat3Label },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "Sora, sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Career Passport Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 15 }}
            animate={isVisible ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative flex justify-center"
          >
            {/* Glow behind card */}
            <div
              className="absolute inset-0 opacity-40 blur-[60px]"
              style={{
                background:
                  "radial-gradient(ellipse at center, #00F2FF33, transparent 70%)",
              }}
            />

            {/* Career Passport */}
            <div
              className="relative w-full max-w-md rounded-2xl p-6 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(0,242,255,0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 40px rgba(0,242,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {t.hero.careerPassport}
                  </div>
                  <div
                    className="text-white"
                    style={{
                      fontFamily: "Sora, sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                    }}
                  >
                    {t.hero.userName}
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(204,255,0,0.1)",
                    border: "1px solid rgba(204,255,0,0.3)",
                  }}
                >
                  <span
                    style={{
                      color: "#CCFF00",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {t.hero.level}
                  </span>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="w-full h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid
                      stroke="rgba(0,242,255,0.1)"
                      strokeDasharray="3 3"
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#00F2FF"
                      fill="#00F2FF"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Match Result */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background: "rgba(0,242,255,0.05)",
                  border: "1px solid rgba(0,242,255,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                    }}
                  >
                    {t.hero.bestMatch}
                  </span>
                  <span
                    style={{
                      color: "#CCFF00",
                      fontFamily: "Sora, sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                    }}
                  >
                    {t.hero.matchPercent}
                  </span>
                </div>
                <div
                  className="text-white"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {t.hero.matchProfession}
                </div>
                <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00F2FF, #CCFF00)" }}
                  />
                </div>
              </div>

              {/* XP Bar */}
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.6875rem",
                    fontWeight: 400,
                  }}
                >
                  {t.hero.xpNote}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: i <= 4 ? "#00F2FF" : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-2 sm:-right-6 px-4 py-2 rounded-xl"
              style={{
                background: "rgba(204,255,0,0.1)",
                border: "1px solid rgba(204,255,0,0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                style={{
                  color: "#CCFF00",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {t.hero.badgeTop}
              </span>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-2 sm:-left-6 px-4 py-2 rounded-xl"
              style={{
                background: "rgba(0,242,255,0.08)",
                border: "1px solid rgba(0,242,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                style={{
                  color: "#00F2FF",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {t.hero.badgeBottom}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 w-full h-32"
        style={{
          background: "linear-gradient(to top, #0A0F1E, transparent)",
        }}
      />
    </section>
  );
}
