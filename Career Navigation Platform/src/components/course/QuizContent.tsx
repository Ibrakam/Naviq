import * as React from "react";
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "motion/react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswers: string[]; // Can be single or multiple
  explanation?: string;
  type?: "single" | "multiple";
}

export interface QuizContentProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  onAnswer?: (questionId: string, isCorrect: boolean) => void;
  className?: string;
}

interface QuizState {
  currentIndex: number;
  selectedAnswers: Map<string, string[]>;
  submittedQuestions: Set<string>;
  correctCount: number;
}

export function QuizContent({ 
  questions, 
  onComplete, 
  onAnswer,
  className 
}: QuizContentProps) {
  const [state, setState] = React.useState<QuizState>({
    currentIndex: 0,
    selectedAnswers: new Map(),
    submittedQuestions: new Set(),
    correctCount: 0,
  });

  const currentQuestion = questions[state.currentIndex];
  const isMultiple = currentQuestion?.type === "multiple" || currentQuestion?.correctAnswers.length > 1;
  const isSubmitted = state.submittedQuestions.has(currentQuestion?.id);
  const selectedForCurrent = state.selectedAnswers.get(currentQuestion?.id) || [];
  
  const isCorrect = React.useMemo(() => {
    if (!isSubmitted) return null;
    const correct = currentQuestion.correctAnswers;
    if (correct.length !== selectedForCurrent.length) return false;
    return correct.every(id => selectedForCurrent.includes(id));
  }, [isSubmitted, currentQuestion, selectedForCurrent]);

  const handleSingleSelect = (value: string) => {
    if (isSubmitted) return;
    setState(prev => ({
      ...prev,
      selectedAnswers: new Map(prev.selectedAnswers).set(currentQuestion.id, [value]),
    }));
  };

  const handleMultipleSelect = (optionId: string, checked: boolean) => {
    if (isSubmitted) return;
    setState(prev => {
      const current = prev.selectedAnswers.get(currentQuestion.id) || [];
      const updated = checked 
        ? [...current, optionId]
        : current.filter(id => id !== optionId);
      return {
        ...prev,
        selectedAnswers: new Map(prev.selectedAnswers).set(currentQuestion.id, updated),
      };
    });
  };

  const handleSubmit = () => {
    const correct = currentQuestion.correctAnswers;
    const selected = selectedForCurrent;
    const isAnswerCorrect = 
      correct.length === selected.length && 
      correct.every(id => selected.includes(id));

    onAnswer?.(currentQuestion.id, isAnswerCorrect);

    setState(prev => ({
      ...prev,
      submittedQuestions: new Set(prev.submittedQuestions).add(currentQuestion.id),
      correctCount: prev.correctCount + (isAnswerCorrect ? 1 : 0),
    }));
  };

  const handleNext = () => {
    if (state.currentIndex < questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    } else {
      // Quiz complete
      onComplete?.(state.correctCount, questions.length);
    }
  };

  const handleRetry = () => {
    setState({
      currentIndex: 0,
      selectedAnswers: new Map(),
      submittedQuestions: new Set(),
      correctCount: 0,
    });
  };

  const progress = ((state.currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = state.currentIndex === questions.length - 1;
  const isQuizComplete = isLastQuestion && isSubmitted;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress indicator */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-slate-200">
          {state.currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-white/10 bg-[#0f1529]/80 backdrop-blur-lg shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7B61FF]/15">
                  <HelpCircle className="h-4 w-4 text-[#7B61FF]" />
                </div>
                <CardTitle className="flex-1 text-xl font-semibold text-white">
                  {currentQuestion?.question}
                </CardTitle>
              </div>
              {isMultiple && (
                <p className="mt-2 text-sm text-slate-300">
                  Выберите все правильные ответы
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isMultiple ? (
                <div className="space-y-3">
                  {currentQuestion?.options.map((option) => {
                    const isSelected = selectedForCurrent.includes(option.id);
                    const isCorrectOption = currentQuestion.correctAnswers.includes(option.id);
                    
                    let optionStyle = "border-white/10 bg-white/5 hover:bg-white/10";
                    if (isSubmitted) {
                      if (isCorrectOption) {
                        optionStyle = "border-[#10B981]/40 bg-[#10B981]/10";
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = "border-red-400/50 bg-red-500/10";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-[#7B61FF]/40 bg-[#7B61FF]/10";
                    }

                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 p-4 transition-all cursor-pointer text-slate-100",
                          optionStyle,
                          isSubmitted && "cursor-default"
                        )}
                        onClick={() => !isSubmitted && handleMultipleSelect(option.id, !isSelected)}
                      >
                        <Checkbox
                          id={option.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleMultipleSelect(option.id, !!checked)}
                          disabled={isSubmitted}
                          className="h-5 w-5"
                        />
                        <Label 
                          htmlFor={option.id} 
                          className={cn(
                            "flex-1 cursor-pointer text-base text-slate-100",
                            isSubmitted && "cursor-default"
                          )}
                        >
                          {option.text}
                        </Label>
                        {isSubmitted && isCorrectOption && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                        {isSubmitted && isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <RadioGroup
                  value={selectedForCurrent[0] || ""}
                  onValueChange={handleSingleSelect}
                  className="space-y-3"
                  disabled={isSubmitted}
                >
                  {currentQuestion?.options.map((option) => {
                    const isSelected = selectedForCurrent[0] === option.id;
                    const isCorrectOption = currentQuestion.correctAnswers.includes(option.id);
                    
                    let optionStyle = "border-white/10 bg-white/5 hover:bg-white/10";
                    if (isSubmitted) {
                      if (isCorrectOption) {
                        optionStyle = "border-[#10B981]/40 bg-[#10B981]/10";
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = "border-red-400/50 bg-red-500/10";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-[#7B61FF]/40 bg-[#7B61FF]/10";
                    }

                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 p-4 transition-all cursor-pointer text-slate-100",
                          optionStyle,
                          isSubmitted && "cursor-default"
                        )}
                        onClick={() => !isSubmitted && handleSingleSelect(option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} className="h-5 w-5" />
                        <Label 
                          htmlFor={option.id} 
                          className={cn(
                            "flex-1 cursor-pointer text-base text-slate-100",
                            isSubmitted && "cursor-default"
                          )}
                        >
                          {option.text}
                        </Label>
                        {isSubmitted && isCorrectOption && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                        {isSubmitted && isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        "mt-4 rounded-xl p-4 border",
                        isCorrect 
                          ? "bg-[#0f1f1a] border-[#10B981]/30" 
                          : "bg-[#2b1418] border-red-500/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                            <span className="font-medium text-[#c8f4e1]">Правильно!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-400" />
                            <span className="font-medium text-red-100">Неправильно</span>
                          </>
                        )}
                      </div>
                      {currentQuestion.explanation && (
                        <p className={cn(
                          "mt-2 text-sm",
                          isCorrect ? "text-emerald-100" : "text-red-100"
                        )}>
                          {currentQuestion.explanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                {!isSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedForCurrent.length === 0}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Проверить ответ
                  </Button>
                ) : isQuizComplete ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      className="gap-2 border-white/15 text-white hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Пройти заново
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Следующий вопрос
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Quiz complete summary */}
      <AnimatePresence>
        {isQuizComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={cn(
              "border-2",
              state.correctCount === questions.length 
                ? "border-[#10B981]/40 bg-gradient-to-br from-[#0f1f1a] to-[#0f2620]" 
                : state.correctCount >= questions.length / 2
                ? "border-amber-300/50 bg-gradient-to-br from-[#2b2414] to-[#3b2f18]"
                : "border-red-400/50 bg-gradient-to-br from-[#2a0f15] to-[#31121a]"
            )}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {state.correctCount === questions.length 
                      ? "🎉" 
                      : state.correctCount >= questions.length / 2 
                      ? "👍" 
                      : "📚"}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Квиз завершен!
                  </h3>
                  <p className="mt-2 text-lg text-slate-200">
                    Вы ответили правильно на{" "}
                    <span className="font-bold text-violet-600">
                      {state.correctCount}
                    </span>{" "}
                    из{" "}
                    <span className="font-bold">{questions.length}</span>{" "}
                    вопросов
                  </p>
                  <div className="mt-4 h-3 w-full rounded-full bg-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        state.correctCount === questions.length 
                          ? "bg-emerald-500" 
                          : state.correctCount >= questions.length / 2
                          ? "bg-amber-500"
                          : "bg-red-500"
                      )}
                      style={{ 
                        width: `${(state.correctCount / questions.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
