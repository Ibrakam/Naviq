import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Brain, BarChart3, Target, TrendingUp } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { useTranslation } from "../../i18n/LanguageContext";

const matchData = [
  { profession: "System Architect", match: 92, color: "#00F2FF" },
  { profession: "Product Manager", match: 87, color: "#CCFF00" },
  { profession: "Data Scientist", match: 78, color: "#00F2FF" },
  { profession: "UX Designer", match: 71, color: "#CCFF00" },
];

export function AnalyticsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const skillData = [
    { subject: t.analytics.radarLogic, A: 85 },
    { subject: t.analytics.radarCreative, A: 70 },
    { subject: t.analytics.radarSoftSkills, A: 92 },
    { subject: t.analytics.radarAnalytics, A: 78 },
    { subject: t.analytics.radarLeadership, A: 60 },
    { subject: t.analytics.radarTech, A: 88 },
  ];

  const gapData = [
    { name: t.analytics.gapNow, value: 45, target: 100 },
    { name: t.analytics.gap3m, value: 72, target: 100 },
    { name: t.analytics.gap6m, value: 88, target: 100 },
    { name: t.analytics.gapGoal, value: 100, target: 100 },
  ];

  return (
    <section
      ref={sectionRef}
      id="аналитика"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "#0A0F1E" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 blur-[120px]"
        style={{ background: "#00F2FF" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-6 h-6" style={{ color: "#00F2FF" }} />
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
              {t.analytics.label}
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
            {t.analytics.titleLine1}
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.analytics.titleHighlight}
            </span>
            {t.analytics.titleLine2}
          </h2>
        </motion.div>

        {/* Dashboard Mockup */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skill Radar - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl p-6 sm:p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,242,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,242,255,0.1)" }}
              >
                <Target className="w-5 h-5" style={{ color: "#00F2FF" }} />
              </div>
              <div>
                <div
                  className="text-white"
                  style={{ fontFamily: "Sora, sans-serif", fontSize: "1rem", fontWeight: 700 }}
                >
                  {t.analytics.skillRadar}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                  }}
                >
                  {t.analytics.skillRadarDesc}
                </div>
              </div>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                  <PolarGrid stroke="rgba(0,242,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "rgba(255,255,255,0.5)",
                      fontSize: 12,
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
                    fill="url(#radarGradient)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00F2FF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#CCFF00" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column - Stacked Cards */}
          <div className="flex flex-col gap-6">
            {/* Success Probability */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(204,255,0,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5" style={{ color: "#CCFF00" }} />
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {t.analytics.matchLabel}
                </span>
              </div>

              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #CCFF00, #00F2FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                {t.analytics.matchPercent}
              </div>
              <div
                className="mt-1"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {t.analytics.matchProfession}
              </div>

              <div className="w-full h-2 rounded-full mt-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "92%" } : {}}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #CCFF00, #00F2FF)" }}
                />
              </div>
            </motion.div>

            {/* Gap Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="rounded-2xl p-6 flex-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,242,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5" style={{ color: "#00F2FF" }} />
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {t.analytics.gapAnalysis}
                </span>
              </div>

              <div
                className="mb-3"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.8125rem",
                  fontWeight: 400,
                }}
              >
                {t.analytics.gapPath}
              </div>

              <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gapData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: "rgba(255,255,255,0.3)",
                        fontSize: 10,
                        fontFamily: "Inter, sans-serif",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500}>
                      {gapData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === gapData.length - 1
                              ? "#CCFF00"
                              : "#00F2FF"
                          }
                          fillOpacity={0.2 + index * 0.25}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Profession Match Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {matchData.map((item, i) => (
            <motion.div
              key={item.profession}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: item.color,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}33`,
                }}
              >
                {item.match}%
              </div>
              <div>
                <div
                  className="text-white"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  {item.profession}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.6875rem",
                    fontWeight: 400,
                  }}
                >
                  {t.analytics.profileMatch}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
