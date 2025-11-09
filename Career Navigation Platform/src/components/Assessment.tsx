import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Target,
  BookOpen,
  Calendar,
  GraduationCap,
  ListChecks,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { apiRoutes, buildApiUrl } from '../utils/api';

interface AssessmentProps {
  accessToken: string;
  onComplete: () => void;
  onBack: () => void;
}

interface AssessmentOption {
  code: string;
  text: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  options?: AssessmentOption[];
  category?: string;
}

export interface CareerResultProps {
  results: any;
  onComplete: () => void;
}

export function CareerResultPage({ results, onComplete }: CareerResultProps) {
  const primaryTrack = results.tracks?.[0];
  const secondaryTrack = results.tracks?.[1];
  const courses = results.suggestedCourses || [];

  // Convert plan to array format if it's an object
  const planArray = React.useMemo(() => {
    // Check both 'plan' and 'development_plan' fields
    const planData = results.plan || results.development_plan;
    if (!planData) return [];
    if (Array.isArray(planData)) return planData;
    // If it's an object, convert to array
    if (typeof planData === 'object') {
      return Object.entries(planData).map(([day, task]) => ({
        day,
        task: String(task),
      }));
    }
    return [];
  }, [results.plan, results.development_plan]);

  const recommendedSteps = [
    `Добавь курс по направлению «${primaryTrack?.name || 'выбранному треку'}»`,
    'Пройди симуляцию «Call с клиентом»',
    'Заполни профиль на 100%',
    'Подготовь вопросы для ментора',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10 md:space-y-14">
        {/* Header */}
        <section className="rounded-xl border-2 border-gray-200 bg-white p-6 md:p-8 shadow-md mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Результат готов
            </span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Твои карьерные результаты</h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {primaryTrack?.reason || 'Ты чаще выбираешь сценарии про людей и коммуникацию. Мы подобрали треки, которые помогут закрепить это в карьере.'}
            </p>
          </div>
        </section>

        {/* Top cards */}
        <section className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Основной трек</p>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{primaryTrack?.name || '—'}</h3>
            <p className="text-sm text-gray-600">лучшее совпадение</p>
            {primaryTrack?.match_percentage && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${primaryTrack.match_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{primaryTrack.match_percentage}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Альтернатива</p>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{secondaryTrack?.name || 'Скоро определим'}</h3>
            <p className="text-sm text-gray-600">второй по силе трек</p>
            {secondaryTrack?.match_percentage && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all"
                      style={{ width: `${secondaryTrack.match_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{secondaryTrack.match_percentage}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Следующий шаг</p>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Пройди первую симуляцию</h3>
              <p className="text-sm text-gray-600">закрепи результат практикой</p>
            </div>
            <Button
              onClick={onComplete}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              Перейти к симуляциям
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Career tracks */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Твои карьерные направления</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {primaryTrack && (
              <div className="rounded-lg border-2 border-green-300 bg-white p-6 md:p-8 hover:shadow-md transition-all">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 mb-4">
                  Лучшее совпадение
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{primaryTrack.name}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-5">
                  {primaryTrack.reason || 'Ты выбираешь варианты про скорость, стабильность и понятный результат.'}
                </p>
                {primaryTrack.skills && primaryTrack.skills.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Навыки</p>
                    <div className="flex flex-wrap gap-2">
                      {primaryTrack.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {secondaryTrack && (
              <div className="rounded-lg border-2 border-gray-300 bg-white p-6 md:p-8 hover:shadow-md transition-all">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 mb-4">
                  Тебе также подойдёт
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{secondaryTrack.name}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-5">
                  {secondaryTrack.reason || 'Ты думаешь категориями рынка, дедлайнов и влияния на людей.'}
                </p>
                {secondaryTrack.skills && secondaryTrack.skills.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Навыки</p>
                    <div className="flex flex-wrap gap-2">
                      {secondaryTrack.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Courses (optional) */}
        {courses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Рекомендованные курсы</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course: any, idx: number) => (
                <div key={course.title || idx} className="rounded-2xl bg-white p-6 hover:shadow-md transition-all">
                  <p className="text-base font-semibold text-gray-900 mb-3">{course.title || course.name}</p>
                  <p className="text-sm text-gray-600">{course.platform}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended steps */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Рекомендованные шаги</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              {recommendedSteps.map((step, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 text-sm md:text-base text-gray-800 hover:bg-gray-100 hover:border-green-300 transition-all flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-green-600">{idx + 1}</span>
                  </div>
                  <p className="flex-1 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7-day plan */}
        
      </div>
    </div>
  );
}

export function Assessment({ accessToken, onComplete, onBack }: AssessmentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch(buildApiUrl(apiRoutes.assessmentQuestions), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load questions');
      }

      const data = await response.json();
      setQuestions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
      alert('Ошибка при загрузке вопросов');
      setIsLoading(false);
    }
  };

  const handleAnswer = (value: number | string) => {
    const currentQ = questions[currentQuestion];
    const newAnswer = {
      questionId: currentQ.id,
      value: value,
      category: currentQ.category,
    };

    // Update or add answer
    const updatedAnswers = answers.filter(a => a.questionId !== currentQ.id);
    updatedAnswers.push(newAnswer);
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment(updatedAnswers);
    }
  };

  const submitAssessment = async (finalAnswers: any[]) => {
    setIsSubmitting(true);
    try {
      // Convert to backend format
      const answersArray = finalAnswers.map(answer => ({
        question_id: answer.questionId,
        answer: answer.value,
      }));

      const response = await fetch(
        buildApiUrl(apiRoutes.assessmentSubmit),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ answers: answersArray }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      // Transform backend response to match frontend expectations
      setResults({
        explanation: data.top_tracks?.[0]?.reason || 'Анализ завершен',
        primaryTrack: data.primary_track || data.top_tracks?.[0]?.track_id,
        tracks:
          data.top_tracks?.map((track: any, index: number) => ({
            id: track.track_id || track.name.toLowerCase().replace(/\s+/g, '_'),
            name: track.name,
            match: track.match_percentage,
            description: track.description,
            reason: track.reason,
            badge: index === 0 ? 'primary' : 'secondary',
          })) || [],
        suggestedCourses:
          data.courses?.map((course: any) => ({
            title: course.name,
            platform: course.platform,
          })) || [],
        plan:
          Object.entries(data.development_plan || {}).map(([day, task]) => ({
            day,
            task,
          })) || [],
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Ошибка при отправке теста');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      onBack();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Загрузка вопросов...</h2>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Вопросы не найдены</h2>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Анализируем твои ответы...</h2>
          <p className="text-gray-600">
            AI создаёт персональные рекомендации
          </p>
        </div>
      </div>
    );
  }

  if (results) {
    return <CareerResultPage results={results} onComplete={onComplete} />;
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={goBack} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentQuestion === 0 ? 'Назад' : 'Предыдущий вопрос'}
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl mb-8">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.type === 'likert' ? (
              // Likert scale - fixed buttons with values 1-5
              [
              { value: 5, label: 'Полностью согласен' },
              { value: 4, label: 'Скорее согласен' },
              { value: 3, label: 'Нейтрально' },
              { value: 2, label: 'Скорее не согласен' },
              { value: 1, label: 'Совершенно не согласен' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    currentAnswer?.value === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                  }`}
              >
                {option.label}
              </button>
              ))
            ) : currentQ.type === 'multiple_choice' ? (
              // Multiple choice questions
              currentQ.options?.map((option) => (
                <button
                  key={option.code}
                  onClick={() => handleAnswer(option.code)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    currentAnswer?.value === option.code
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  <span className="font-semibold mr-2">{option.code}.</span>
                  {option.text}
                </button>
              ))
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
