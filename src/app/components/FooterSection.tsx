import { motion } from "motion/react";
import { Zap, ArrowRight, Mail, Send } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { redirectToApp } from "../../lib/appLinks";

export function FooterSection() {
  const { t } = useTranslation();

  return (
    <>
      {/* Final CTA Section */}
      <section
        className="relative py-24 sm:py-32 overflow-hidden"
        style={{ background: "#0A0F1E" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[150px]"
          style={{ background: "radial-gradient(circle, #00F2FF, #CCFF0033)" }}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-white mb-6"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.15,
              }}
            >
              {t.footer.ctaTitle}
              <span
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.footer.ctaTitleHighlight}
              </span>
            </h2>

            <p
              className="mb-10 max-w-lg mx-auto"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "Inter, sans-serif",
                fontSize: "1.0625rem",
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              {t.footer.ctaSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => redirectToApp("/register")}
                className="group flex items-center justify-center gap-2 px-10 py-4 rounded-full text-[#0A0F1E] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  boxShadow: "0 0 40px rgba(0,242,255,0.3), 0 0 80px rgba(0,242,255,0.1)",
                }}
              >
                {t.footer.ctaButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            <p
              className="mt-4"
              style={{
                color: "rgba(255,255,255,0.25)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.8125rem",
                fontWeight: 400,
              }}
            >
              {t.footer.ctaNote}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-12 overflow-hidden"
        style={{
          background: "#060913",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #00F2FF, #CCFF00)" }}
                >
                  <Zap className="w-5 h-5 text-[#0A0F1E]" />
                </div>
                <span
                  className="text-white"
                  style={{ fontFamily: "Sora, sans-serif", fontSize: "1.25rem", fontWeight: 700 }}
                >
                  Naviq
                </span>
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.8125rem",
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                {t.footer.brandDesc}
              </p>
            </div>

            {/* Product */}
            <div>
              <div
                className="mb-4"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.footer.productTitle}
              </div>
              <div className="flex flex-col gap-2">
                {t.footer.productItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="transition-colors hover:text-[#00F2FF]"
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 400,
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <div
                className="mb-4"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.footer.companyTitle}
              </div>
              <div className="flex flex-col gap-2">
                {t.footer.companyItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="transition-colors hover:text-[#00F2FF]"
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 400,
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <div
                className="mb-4"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.footer.newsletterTitle}
              </div>
              <div className="flex gap-2">
                <div
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Mail className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                  <input
                    type="email"
                    placeholder={t.footer.emailPlaceholder}
                    className="bg-transparent border-none outline-none flex-1 w-full"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8125rem",
                    }}
                  />
                </div>
                <button
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  }}
                >
                  <Send className="w-4 h-4 text-[#0A0F1E]" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.2)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 400,
              }}
            >
              {t.footer.copyright}
            </span>
            <div className="flex gap-6">
              {[t.footer.privacy, t.footer.terms].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-[#00F2FF] transition-colors"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
