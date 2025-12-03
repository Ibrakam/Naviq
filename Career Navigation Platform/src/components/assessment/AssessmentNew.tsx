import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { apiRoutes, buildApiUrl } from '../../utils/api';

interface AssessmentNewProps {
  accessToken: string;
  onComplete: () => void;
  onBack: () => void;
}

interface BackendOption {
  code: string;
  text: string;
}

interface BackendQuestion {
  id: number;
  question: string;
  type: string;
  options: BackendOption[];
  category: string;
  required: boolean;
}

interface Answer {
  id: string;
  text: string;
  code: string;
}

interface Question {
  id: number;
  text: string;
  category: string;
  answers: Answer[];
}

interface UserAnswer {
  question_id: number;
  answer: string; // The answer code (A/B/C/D)
}

export function AssessmentNew({ accessToken, onComplete, onBack }: AssessmentNewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl(apiRoutes.assessmentQuestions), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load questions');
      }

      const backendData: BackendQuestion[] = await response.json();

      // Transform backend format to frontend format
      const transformedQuestions: Question[] = backendData.map((q) => ({
        id: q.id,
        text: q.question,
        category: q.category || 'general',
        answers: (q.options || []).map((opt) => ({
          id: opt.code,
          text: opt.text,
          code: opt.code,
        })),
      }));

      setQuestions(transformedQuestions);
    } catch (err: any) {
      console.error('Error loading questions:', err);
      setError(err.message || 'Unable to load assessment questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswerData = currentQuestion.answers.find((a) => a.id === selectedAnswer);

    if (!selectedAnswerData) return;

    // Save answer (just question_id and answer code)
    const userAnswer: UserAnswer = {
      question_id: currentQuestion.id,
      answer: selectedAnswerData.code, // Store the answer code (A/B/C/D)
    };

    setAnswers((prev) => [...prev, userAnswer]);
    setSelectedAnswer(null);

    // Move to next question or submit
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitAssessment([...answers, userAnswer]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Restore previous answer
      const previousAnswer = answers[currentQuestionIndex - 1];
      if (previousAnswer) {
        setSelectedAnswer(previousAnswer.answer);
      }
    }
  };

  const submitAssessment = async (finalAnswers: UserAnswer[]) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(apiRoutes.assessmentSubmit), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      // Navigate to results
      onComplete();
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(123, 97, 255, 0.15), transparent 40%), linear-gradient(135deg, #f0f4ff 0%, #f6f8ff 40%, #e6f7f1 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#edeaff] to-[#d2e9ff] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#6555ff]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Загрузка теста...</h2>
          <p className="text-white/70">Подготавливаем вопросы</p>
        </motion.div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Ошибка загрузки</h2>
          <p className="text-white/70 mb-6">{error || 'Не удалось загрузить вопросы'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(123, 97, 255, 0.15), transparent 40%), linear-gradient(135deg, #f0f4ff 0%, #f6f8ff 40%, #e6f7f1 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 bg-gradient-to-br from-[#6555ff] to-[#4fb5ff] rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Анализ результатов...</h2>
          <p className="text-white/70">AI обрабатывает ваши ответы</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12 px-4" style={{
      background: 'radial-gradient(circle at 20% 30%, rgba(123, 97, 255, 0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(0, 229, 160, 0.12), transparent 40%), linear-gradient(135deg, #f0f4ff 0%, #f6f8ff 40%, #e6f7f1 100%)'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="text-sm text-white/70 font-medium">
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Прогресс</span>
            <span className="text-sm font-semibold text-[#6555ff]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6555ff] to-[#4fb5ff]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-white/60 p-8 md:p-10 shadow-[0_20px_60px_rgba(73,92,175,0.15)] mb-8"
          >
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3f5ff] rounded-full text-sm font-semibold text-[#6555ff]">
                {currentQuestion.category === 'interests' && '💡 Интересы'}
                {currentQuestion.category === 'skills' && '🎯 Навыки'}
                {currentQuestion.category === 'values' && '⭐ Ценности'}
                {currentQuestion.category === 'personality' && '🧠 Личность'}
                {currentQuestion.category === 'preferences' && '🎨 Предпочтения'}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.answers.map((answer, index) => (
                <motion.button
                  key={answer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                    selectedAnswer === answer.id
                      ? 'border-[#6555ff] bg-gradient-to-r from-[#f3f5ff] to-[#e9f5ff] shadow-[0_8px_30px_rgba(101,85,255,0.25)]'
                      : 'border-white/20 bg-white/80 backdrop-blur-xl hover:border-[#d2d7ff] hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base md:text-lg text-gray-800 font-medium pr-4">
                      {answer.text}
                    </span>
                    {selectedAnswer === answer.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle2 className="w-6 h-6 text-[#6555ff]" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="px-6 py-3 bg-gradient-to-r from-[#6555ff] to-[#4fb5ff] hover:from-[#5647f0] hover:to-[#3fa3e8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Далее
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Завершить
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
