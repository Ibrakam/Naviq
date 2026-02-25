import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, ArrowRight } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { redirectToApp } from "../../lib/appLinks";

export function ExitIntentPopup() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 5 && !dismissed && !show) {
        setShow(true);
      }
    },
    [dismissed, show]
  );

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-md rounded-2xl p-8"
            style={{
              background: "rgba(10,15,30,0.95)",
              border: "1px solid rgba(0,242,255,0.2)",
              boxShadow: "0 0 60px rgba(0,242,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-lg cursor-pointer transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto"
              style={{
                background: "linear-gradient(135deg, rgba(0,242,255,0.2), rgba(204,255,0,0.2))",
                border: "1px solid rgba(0,242,255,0.2)",
              }}
            >
              <Gift className="w-7 h-7" style={{ color: "#00F2FF" }} />
            </div>

            <h3
              className="text-center text-white mb-3"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "1.375rem",
                fontWeight: 800,
                lineHeight: 1.3,
              }}
            >
              {t.exitPopup.title}
            </h3>

            <p
              className="text-center mb-8"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9375rem",
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              {t.exitPopup.subtitle}
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder={t.exitPopup.emailPlaceholder}
                className="flex-1 px-4 py-3 rounded-xl outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.9375rem",
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => redirectToApp("/register")}
                className="px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shrink-0"
                style={{
                  background: "linear-gradient(135deg, #00F2FF, #CCFF00)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#0A0F1E",
                }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            <p
              className="text-center"
              style={{
                color: "rgba(255,255,255,0.2)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 400,
              }}
            >
              {t.exitPopup.note}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
