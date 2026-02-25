import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Menu, X } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { redirectToApp } from "../../lib/appLinks";

export function NavHeader() {
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [t.nav.analytics, t.nav.simulations, t.nav.reviews];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-[3px] left-0 w-full z-50"
      style={{
        background: "rgba(10,15,30,0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,242,255,0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00F2FF, #CCFF00)" }}
          >
            <Zap className="w-5 h-5 text-[#0A0F1E]" />
          </div>
          <span className="text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "1.25rem", fontWeight: 700 }}>
            Naviq
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-400 hover:text-[#00F2FF] transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA + Language Switcher + Mobile */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full cursor-pointer transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: locale === "ru" ? 700 : 400,
                color: locale === "ru" ? "#00F2FF" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s",
              }}
            >
              RU
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem" }}>/</span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                fontWeight: locale === "uz" ? 700 : 400,
                color: locale === "uz" ? "#CCFF00" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s",
              }}
            >
              UZ
            </span>
          </button>

          <AnimatePresence>
            {showStickyCta && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => redirectToApp("/register")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-[#0A0F1E] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  boxShadow: "0 0 20px rgba(0,242,255,0.4)",
                }}
              >
                <Zap className="w-4 h-4" />
                {t.nav.cta}
              </motion.button>
            )}
          </AnimatePresence>
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: "rgba(10,15,30,0.95)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 py-2"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "1rem", fontWeight: 500 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button
                onClick={() => redirectToApp("/register")}
                className="w-full py-3 rounded-full text-[#0A0F1E] mt-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                }}
              >
                {t.nav.ctaMobile}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
