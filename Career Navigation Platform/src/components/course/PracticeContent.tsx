import * as React from "react";
import { CheckCircle2, Circle, Send, Save, Loader2, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "motion/react";

export interface PracticeContentProps {
  title: string;
  description: string;
  prompt: string;
  keywords?: string[];
  hints?: string[];
  minLength?: number;
  savedAnswer?: string;
  onSave?: (answer: string) => Promise<void>;
  onSubmit?: (answer: string, matchedKeywords: string[]) => void;
  className?: string;
}

export function PracticeContent({
  title,
  description,
  prompt,
  keywords = [],
  hints = [],
  minLength = 50,
  savedAnswer = "",
  onSave,
  onSubmit,
  className,
}: PracticeContentProps) {
  const [answer, setAnswer] = React.useState(savedAnswer);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [showHints, setShowHints] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Check which keywords are present in the answer
  const matchedKeywords = React.useMemo(() => {
    if (!answer) return [];
    const lowerAnswer = answer.toLowerCase();
    return keywords.filter(keyword => 
      lowerAnswer.includes(keyword.toLowerCase())
    );
  }, [answer, keywords]);

  const progress = React.useMemo(() => {
    if (keywords.length === 0) return answer.length >= minLength ? 100 : 0;
    return Math.round((matchedKeywords.length / keywords.length) * 100);
  }, [matchedKeywords, keywords, answer, minLength]);

  const canSubmit = answer.length >= minLength;

  // Auto-save with debounce
  React.useEffect(() => {
    if (answer === savedAnswer || !onSave) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(answer);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answer, savedAnswer, onSave]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit?.(answer, matchedKeywords);
  };

  const handleSaveNow = async () => {
    if (!onSave || isSaving) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsSaving(true);
    try {
      await onSave(answer);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Title and description */}
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-slate-200 leading-relaxed">{description}</p>
      </div>

      {/* Prompt card */}
      <Card className="border border-[#7B61FF]/30 bg-gradient-to-br from-[#161d38] via-[#0f1529] to-[#1b2542] backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-[#cdd3ff]">
            <Lightbulb className="h-5 w-5" />
            Задание
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-100 leading-relaxed">{prompt}</p>
        </CardContent>
      </Card>

      {/* Hints */}
      {hints.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="text-slate-200 hover:text-white"
          >
            {showHints ? "Скрыть подсказки" : "Показать подсказки"}
          </Button>
          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="mt-2 border border-amber-300/40 bg-[#2b2414]">
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {hints.map((hint, i) => (
                        <li key={i} className="flex items-start gap-2 text-amber-100">
                          <span className="text-amber-300">💡</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Answer textarea */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-200">
            Ваш ответ
          </label>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {isSaving && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Сохранение...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-emerald-300">
                Сохранено в {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Напишите ваш ответ здесь..."
          className="min-h-[200px] resize-y text-base leading-relaxed bg-white/5 text-slate-100 border-white/10 placeholder:text-slate-500 focus-visible:ring-[#7B61FF]/40 focus-visible:border-[#7B61FF]"
          disabled={isSubmitted}
        />
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
            "text-slate-400",
            answer.length < minLength && "text-amber-300"
          )}>
            {answer.length} символов
            {answer.length < minLength && ` (минимум ${minLength})`}
          </span>
        </div>
      </div>

      {/* Keywords checklist */}
      {keywords.length > 0 && (
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white">
                Критерии оценки
              </CardTitle>
              <Badge 
                variant="secondary"
                className={cn(
                  "border border-white/10",
                  progress === 100 && "bg-[#10B981]/20 text-[#d1f7e5]",
                  progress > 50 && progress < 100 && "bg-amber-500/20 text-amber-100",
                  progress <= 50 && "bg-white/10 text-slate-200"
                )}
              >
                {matchedKeywords.length} / {keywords.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {keywords.map((keyword, i) => {
                const isMatched = matchedKeywords.includes(keyword);
                return (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{ 
                      scale: isMatched ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg p-2 transition-colors border border-transparent",
                      isMatched 
                        ? "bg-[#10B981]/15 text-[#d1f7e5] border-[#10B981]/30" 
                        : "bg-white/5 text-slate-200"
                    )}
                  >
                    {isMatched ? (
                      <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="text-sm">{keyword}</span>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 rounded-full bg-white/10">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    progress === 100 && "bg-emerald-500",
                    progress > 50 && progress < 100 && "bg-amber-500",
                    progress <= 50 && "bg-violet-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit feedback */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={cn(
              "border-2",
              progress >= 80 
                ? "border-[#10B981]/40 bg-gradient-to-br from-[#0f1f1a] to-[#102922]"
                : progress >= 50
                ? "border-amber-300/50 bg-gradient-to-br from-[#2b2414] to-[#3b2f18]"
                : "border-white/10 bg-gradient-to-br from-[#111827] to-[#0f1529]"
            )}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">
                    {progress >= 80 ? "🎉" : progress >= 50 ? "👍" : "📝"}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {progress >= 80 
                      ? "Отличная работа!" 
                      : progress >= 50 
                      ? "Хороший ответ!" 
                      : "Ответ принят"}
                  </h3>
                  <p className="mt-2 text-slate-200">
                    {progress >= 80 
                      ? "Вы отлично справились с заданием и раскрыли все ключевые темы."
                      : progress >= 50
                      ? "Вы затронули большинство важных тем. Можете перейти к следующему уроку."
                      : "Ваш ответ сохранен. Рассмотрите возможность дополнить его ключевыми моментами."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveNow}
          disabled={isSaving || answer === savedAnswer}
          className="gap-2 border-white/15 text-white hover:bg-white/10"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Сохранить
        </Button>
        
        {!isSubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2 bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            Отправить ответ
          </Button>
        )}
      </div>
    </div>
  );
}
