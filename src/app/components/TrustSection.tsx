import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { Quote, TrendingUp, Users, BarChart3 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslation } from "../../i18n/LanguageContext";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export function TrustSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: t.trust.testimonial1Name,
      university: t.trust.testimonial1Uni,
      quote: t.trust.testimonial1Quote,
      image: "https://images.unsplash.com/photo-1758800625039-caa9007a7aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMHNtaWxpbmd8ZW58MXx8fHwxNzcxODQwOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      match: t.trust.testimonial1Match,
    },
    {
      name: t.trust.testimonial2Name,
      university: t.trust.testimonial2Uni,
      quote: t.trust.testimonial2Quote,
      image: "https://images.unsplash.com/photo-1716471081169-cb8528a395d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY29sbGVnZSUyMHN0dWRlbnQlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MTg0MDk5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      match: t.trust.testimonial2Match,
    },
    {
      name: t.trust.testimonial3Name,
      university: t.trust.testimonial3Uni,
      quote: t.trust.testimonial3Quote,
      image: "https://images.unsplash.com/photo-1762438136720-137b802248d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHN0dWRlbnQlMjBwb3J0cmFpdCUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzcxODQwOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      match: t.trust.testimonial3Match,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="отзывы"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "#070B16" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Quote className="w-6 h-6" style={{ color: "#00F2FF" }} />
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
              {t.trust.label}
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
            {t.trust.titleBefore}
            <span
              style={{
                background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.trust.titleHighlight}
            </span>
          </h2>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
        >
          {[
            { icon: BarChart3, value: 12340, suffix: "+", label: t.trust.stat1Label },
            { icon: Users, value: 8900, suffix: "+", label: t.trust.stat2Label },
            { icon: TrendingUp, value: 94, suffix: "%", label: t.trust.stat3Label },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <stat.icon
                className="w-5 h-5 mx-auto mb-2"
                style={{ color: "#00F2FF" }}
              />
              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.6875rem",
                  fontWeight: 400,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              className="rounded-2xl p-6 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,242,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Quote */}
              <p
                className="flex-1 mb-6"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.9375rem",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                "{item.quote}"
              </p>

              {/* Match badge */}
              <div
                className="inline-flex self-start px-3 py-1 rounded-full mb-4"
                style={{
                  background: "rgba(204,255,0,0.08)",
                  border: "1px solid rgba(204,255,0,0.2)",
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
                  {item.match}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div
                    className="text-white"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                    }}
                  >
                    {item.university}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
