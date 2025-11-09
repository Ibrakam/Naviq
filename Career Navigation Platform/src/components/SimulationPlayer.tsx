import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Award, XCircle, RotateCcw, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { apiRoutes, buildApiUrl } from '../utils/api';

interface SimulationPlayerProps {
  accessToken: string;
  simulationId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function SimulationPlayer({ accessToken, simulationId, onComplete, onBack }: SimulationPlayerProps) {
  const [simulation, setSimulation] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSimulation();
    loadProgress();
  }, []);

  const loadSimulation = async () => {
    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.simulation(simulationId)),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setSimulation(data.simulation);
    } catch (error) {
      console.error('Failed to load simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepKind = (step: any) => {
    if (step?.kind) {
      return step.kind;
    }
    if (step?.type === 'multipleChoice' || step?.type === 'quiz') {
      return 'choice';
    }
    if (step?.question || step?.type === 'text' || step?.type === 'code') {
      return 'text';
    }
    return 'theory';
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.simulationProgress(simulationId)),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.progress) {
        const parsedAnswers: Record<number, any> = {};
        (data.progress.answers || []).forEach((entry: any) => {
          if (typeof entry.stepIndex === 'number') {
            parsedAnswers[entry.stepIndex] = entry.answer;
          }
        });
        setAnswers(parsedAnswers);
        setCurrentStep(data.progress.stepIndex || 0);
        setCompleted(data.progress.completed || false);
        setResult(data.progress.result);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const buildEntries = (map: Record<number, any>) =>
    Object.keys(map)
      .map((key) => Number(key))
      .sort((a, b) => a - b)
      .map((key) => ({
        stepIndex: key,
        answer: map[key],
      }));

  useEffect(() => {
    const stored = answers[currentStep];
    if (Array.isArray(stored)) {
      setSelectedOptions(stored);
      setCurrentAnswer('');
    } else if (typeof stored === 'string') {
      setCurrentAnswer(stored);
      setSelectedOptions([]);
    } else if (stored !== undefined && stored !== null) {
      setCurrentAnswer(String(stored));
      setSelectedOptions([]);
    } else {
      setCurrentAnswer('');
      setSelectedOptions([]);
    }
  }, [currentStep, answers]);

  const saveProgress = async (stepIndex: number, entries: any[], isCompleted: boolean) => {
    setSaving(true);
    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.simulationProgress(simulationId)),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            stepIndex,
            answers: entries,
            completed: isCompleted,
          }),
        }
      );
      
      const data = await response.json();
      if (data.result) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const step = simulation.steps[currentStep];
    const stepKind = getStepKind(step);

    let updatedAnswers = { ...answers };
    if (stepKind !== 'theory') {
      let answerValue: any = currentAnswer;

      if (step.type === 'quiz') {
        answerValue = currentAnswer;
      } else if (stepKind === 'choice' || step.type === 'multipleChoice') {
        answerValue = selectedOptions;
      }

      updatedAnswers[currentStep] = answerValue;
    }

    setAnswers(updatedAnswers);
    setCurrentAnswer('');
    setSelectedOptions([]);

    const entriesPayload = buildEntries(updatedAnswers);

    if (currentStep < simulation.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveProgress(nextStep, entriesPayload, false);
    } else {
      setCompleted(true);
      await saveProgress(currentStep, entriesPayload, true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRetake = async () => {
    setCurrentStep(0);
    setAnswers({});
    setCurrentAnswer('');
    setSelectedOptions([]);
    setCompleted(false);
    setResult(null);
    await saveProgress(0, [], false);
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Загрузка стажировки...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Стажировка не найдена</h2>
          <Button onClick={onBack}>Вернуться</Button>
        </div>
      </div>
    );
  }

  if (completed && result) {
    const passed = result.passed;
    
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className={`w-24 h-24 ${passed ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {passed ? (
                <Award className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            <h1 className="text-4xl mb-4">
              {passed ? 'Поздравляем! Стажировка пройдена!' : 'Стажировка не пройдена'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {simulation.company && (
                <span className="flex items-center justify-center gap-2 mb-2">
                  <Building2 className="w-5 h-5" />
                  {simulation.company}
                </span>
              )}
              {simulation.title}
            </p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl mb-6">Результаты</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>Набранные баллы</span>
                <span className="text-2xl">{result.score} / {result.maxScore}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>Процент правильных ответов</span>
                <span className={`text-2xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>Статус</span>
                <span className={`px-4 py-2 rounded-full ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {passed ? 'Прошел' : 'Не прошел'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl mb-6">Что дальше?</h2>
            <div className="space-y-4">
              {passed ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">Сертификат добавлен</h3>
                      <p className="text-gray-600 text-sm">
                        Сертификат о прохождении стажировки добавлен в твой профиль
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">Добавь в резюме</h3>
                      <p className="text-gray-600 text-sm">
                        Упомяни эту стажировку в своём резюме и LinkedIn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">Попробуй другие стажировки</h3>
                      <p className="text-gray-600 text-sm">
                        Получи опыт в других компаниях и направлениях
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">Попробуй ещё раз</h3>
                      <p className="text-gray-600 text-sm">
                        Для прохождения нужно набрать минимум 70%. Изучи материалы и попробуй снова!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">Попытка сохранена</h3>
                      <p className="text-gray-600 text-sm">
                        Эта попытка сохранена в твоём профиле. Ты можешь пересдать неограниченное количество раз
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="flex gap-4 justify-center">
            {!passed && (
              <Button onClick={handleRetake} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Пересдать
              </Button>
            )}
            <Button onClick={onComplete} className="bg-green-500 hover:bg-green-600">
              {passed ? 'К дашборду' : 'К каталогу'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const step = simulation.steps[currentStep];
  const stepKind = getStepKind(step);
  const progress = ((currentStep + 1) / simulation.steps.length) * 100;
  const isTheoryStep = stepKind === 'theory';
  const isQuizStep = step.type === 'quiz';
  const isMultiChoiceStep = step.type === 'multipleChoice';
  const isChoiceStep = stepKind === 'choice' || isQuizStep || isMultiChoiceStep;
  const isTextStep = stepKind === 'text' || step.type === 'text' || step.type === 'code';

  const canProceed = () => {
    if (isTheoryStep) return true;
    if (isQuizStep) {
      return currentAnswer && currentAnswer.trim().length > 0;
    }
    if (isMultiChoiceStep) {
      return selectedOptions.length > 0;
    }
    if (stepKind === 'choice') {
      return selectedOptions.length > 0;
    }
    if (isTextStep) {
      return currentAnswer && currentAnswer.trim().length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Выйти из стажировки
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              {simulation.company && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>{simulation.company}</span>
                </div>
              )}
              <h1 className="text-2xl mb-1">{simulation.title}</h1>
              <p className="text-gray-600">
                Шаг {currentStep + 1} из {simulation.steps.length}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-3xl mb-4">{step.title}</h2>
            {(step.task || step.description) && (
              <p className="text-gray-600 text-lg mb-2">{step.task || step.description}</p>
            )}
            {step.expected_output && (
              <p className="text-sm text-gray-500">
                Ожидаемый результат: {step.expected_output}
              </p>
            )}
          </div>

          {!isTheoryStep ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="mb-4">{step.question || 'Выполни задание'}</h3>

              {/* Quiz - Single Choice */}
              {isQuizStep && step.options && (
                <div className="space-y-3">
                  {step.options.map((option: string) => (
                    <button
                      key={option}
                      onClick={() => setCurrentAnswer(option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        currentAnswer === option
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Multiple Choice (legacy) */}
              {isMultiChoiceStep && step.options && !step.kind && (
                <div className="space-y-3">
                  {step.options.map((option: string) => (
                    <div
                      key={option}
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 cursor-pointer"
                      onClick={() => toggleOption(option)}
                    >
                      <Checkbox
                        checked={selectedOptions.includes(option)}
                        onCheckedChange={() => toggleOption(option)}
                      />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Choice buttons */}
              {stepKind === 'choice' && (step.choices || step.options) && (
                <div className="space-y-3">
                  {(step.choices || step.options).map((option: string) => {
                    const isSelected = selectedOptions.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => toggleOption(option)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Code Input */}
              {step.type === 'code' && (
                <div>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={step.input_placeholder || step.placeholder || 'Напиши свой код здесь...'}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    💡 Подсказка: Используй правильный синтаксис и ключевые слова
                  </p>
                </div>
              )}

              {/* Text Input */}
              {isTextStep && step.type !== 'code' && (
                <div>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={step.input_placeholder || step.placeholder || 'Напиши подробный ответ...'}
                    rows={6}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Постарайся привести конкретные цифры или шаги — это повышает ценность ответа.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="mb-3">📚 Теоретический материал</h3>
              <p className="text-gray-700">
                {step.summary || 'Внимательно изучи информацию на этом шаге. Она пригодится для выполнения практических заданий.'}
              </p>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <span className="text-sm text-gray-600">
            {saving ? 'Сохранение...' : 'Автосохранение'}
          </span>

          <Button
            onClick={handleNext}
            className="bg-green-500 hover:bg-green-600"
            disabled={!canProceed()}
          >
            {currentStep === simulation.steps.length - 1 ? 'Завершить' : 'Далее'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
