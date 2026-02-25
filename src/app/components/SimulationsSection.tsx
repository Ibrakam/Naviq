import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Gamepad2, Trophy, Star, Users, ArrowRight, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslation } from "../../i18n/LanguageContext";
import { redirectToApp } from "../../lib/appLinks";

export function SimulationsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const simulations = [
    {
      title: t.simulations.sim1Title,
      desc: t.simulations.sim1Desc,
      image: "https://images.unsplash.com/photo-1591201416399-61405f74788e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwbWFuYWdlciUyMHdvcmtpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzcxODQwOTk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      xp: 500,
      duration: t.simulations.sim1Duration,
      difficulty: t.simulations.sim1Difficulty,
      color: "#00F2FF",
    },
    {
      title: t.simulations.sim2Title,
      desc: t.simulations.sim2Desc,
      image: "https://images.unsplash.com/photo-1608306448197-e83633f1261c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BlciUyMGNvZGluZyUyMHNjcmVlbnxlbnwxfHx8fDE3NzE4NDA5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      xp: 750,
      duration: t.simulations.sim2Duration,
      difficulty: t.simulations.sim2Difficulty,
      color: "#CCFF00",
    },
    {
      title: t.simulations.sim3Title,
      desc: t.simulations.sim3Desc,
      image: "https://images.unsplash.com/photo-1742678531208-7513a486fe9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVWCUyMGRlc2lnbmVyJTIwY3JlYXRpdmUlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcxODQwOTk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      xp: 600,
      duration: t.simulations.sim3Duration,
      difficulty: t.simulations.sim3Difficulty,
      color: "#00F2FF",
    },
  ];

  const leaderboard = [
    { name: "Мария К.", xp: 3200, rank: 1 },
    { name: "Дмитрий Л.", xp: 2890, rank: 2 },
    { name: "Анна С.", xp: 2450, rank: 3 },
    { name: t.simulations.you, xp: 1200, rank: 14, isUser: true },
  ];

  return (
    <section
      ref={sectionRef}
      id="симуляции"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "#070B16" }}
    >
      {/* Ambient */}
      <div
        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]"
        style={{ background: "#CCFF00" }}
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
            <Gamepad2 className="w-6 h-6" style={{ color: "#CCFF00" }} />
            <span
              style={{
                color: "#CCFF00",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {t.simulations.label}
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
            {t.simulations.titleBefore}
            <span
              style={{
                background: "linear-gradient(135deg, #CCFF00, #00F2FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.simulations.titleHighlight}
            </span>
            {t.simulations.titleAfter}
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.0625rem",
              fontWeight: 400,
              lineHeight: 1.7,
            }}
          >
            {t.simulations.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Simulation Cards */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((sim, i) => (
              <motion.div
                key={sim.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                onClick={() => redirectToApp("/register")}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <ImageWithFallback
                    src={sim.image}
                    alt={sim.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, #070B16, transparent 60%)`,
                    }}
                  />
                  {/* XP Badge */}
                  <div
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${sim.color}44`,
                    }}
                  >
                    <Zap className="w-3 h-3" style={{ color: sim.color }} />
                    <span
                      style={{
                        color: sim.color,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                      }}
                    >
                      +{sim.xp} XP
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[0.625rem]"
                      style={{
                        background: `${sim.color}15`,
                        color: sim.color,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {sim.duration}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[0.625rem]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {sim.difficulty}
                    </span>
                  </div>

                  <h3
                    className="text-white mb-1.5"
                    style={{
                      fontFamily: "Sora, sans-serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    {sim.title}
                  </h3>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8125rem",
                      fontWeight: 400,
                      lineHeight: 1.5,
                    }}
                  >
                    {sim.desc}
                  </p>

                  <div
                    className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: sim.color }}
                  >
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                      }}
                    >
                      {t.simulations.start}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gamification Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-4"
          >
            {/* Badge Card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(204,255,0,0.04)",
                border: "1px solid rgba(204,255,0,0.15)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(204,255,0,0.2), rgba(0,242,255,0.2))",
                  }}
                >
                  <Trophy className="w-6 h-6" style={{ color: "#CCFF00" }} />
                </div>
                <div>
                  <div
                    className="text-white"
                    style={{ fontFamily: "Sora, sans-serif", fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    {t.simulations.topStudents}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                    }}
                  >
                    {t.simulations.lastAchievement}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {["🎯", "🧠", "🚀", "💡", "⚡"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      background: i < 3 ? "rgba(204,255,0,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${i < 3 ? "rgba(204,255,0,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* XP Counter */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(0,242,255,0.04)",
                border: "1px solid rgba(0,242,255,0.15)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
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
                  {t.simulations.totalXp}
                </span>
                <Star className="w-4 h-4" style={{ color: "#00F2FF" }} />
              </div>
              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "white",
                }}
              >
                2,450
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#CCFF00",
                    marginLeft: 8,
                  }}
                >
                  +500
                </span>
              </div>
              <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "65%",
                    background: "linear-gradient(90deg, #00F2FF, #CCFF00)",
                  }}
                />
              </div>
              <div
                className="mt-1.5"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: 400,
                }}
              >
                {t.simulations.xpToNext}
              </div>
            </div>

            {/* Mini Leaderboard */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" style={{ color: "#00F2FF" }} />
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {t.simulations.leaderboard}
                </span>
              </div>
              <div className="space-y-2.5">
                {leaderboard.map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
                    style={{
                      background: user.isUser ? "rgba(0,242,255,0.06)" : "transparent",
                      border: user.isUser ? "1px solid rgba(0,242,255,0.15)" : "1px solid transparent",
                    }}
                  >
                    <span
                      className="w-6 text-center"
                      style={{
                        color: user.rank <= 3 ? "#CCFF00" : "rgba(255,255,255,0.3)",
                        fontFamily: "Sora, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      #{user.rank}
                    </span>
                    <span
                      className="flex-1"
                      style={{
                        color: user.isUser ? "#00F2FF" : "rgba(255,255,255,0.6)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.8125rem",
                        fontWeight: user.isUser ? 600 : 400,
                      }}
                    >
                      {user.name}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
