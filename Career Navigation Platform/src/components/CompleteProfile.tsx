import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Calendar as CalendarIcon,
  GraduationCap,
  User,
  School,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Target,
  Award,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Calendar } from './ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { apiRoutes, buildApiUrl } from '../utils/api';

// Format date helper
const formatDate = (date: Date, formatType: 'full' | 'month' = 'full'): string => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  if (formatType === 'month') {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

interface CompleteProfileProps {
  accessToken: string;
  user: any;
  onComplete: () => void;
  isEditMode?: boolean;
  onNavigate?: (page: string) => void;
}

export function CompleteProfile({
  accessToken,
  user,
  onComplete,
  isEditMode = false,
  onNavigate,
}: CompleteProfileProps) {
  const currentYear = new Date().getFullYear();
  const monthLabels = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.date_of_birth ? new Date(user.date_of_birth) : undefined
  );
  const [educationStatus, setEducationStatus] = useState<string>(
    user?.education_status || ''
  );
  const [schoolName, setSchoolName] = useState(user?.school_name || '');
  const [graduationDate, setGraduationDate] = useState<Date | undefined>(
    user?.graduation_date ? new Date(user.graduation_date) : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load fresh user data if in edit mode
  useEffect(() => {
    if (isEditMode && accessToken) {
      const loadUserData = async () => {
        try {
          const response = await fetch(
            buildApiUrl(apiRoutes.profile),
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const data = await response.json();
          const userData = data.profile;
          if (userData) {
            setName(userData.name || '');
            setDateOfBirth(userData.date_of_birth ? new Date(userData.date_of_birth) : undefined);
            setEducationStatus(userData.education_status || '');
            setSchoolName(userData.school_name || '');
            setGraduationDate(userData.graduation_date ? new Date(userData.graduation_date) : undefined);
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      };
      loadUserData();
    }
  }, [isEditMode, accessToken]);

  const defaultDobMonth = dateOfBirth
    ? new Date(dateOfBirth.getFullYear(), dateOfBirth.getMonth(), 1)
    : new Date(currentYear - 16, 0, 1);
  const [dobMonth, setDobMonth] = useState(defaultDobMonth);
  const dobYears = useMemo(() => {
    const years: number[] = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  }, [currentYear]);

  // Calculate progress
  const progress = Math.round(
    ((name ? 1 : 0) +
      (dateOfBirth ? 1 : 0) +
      (educationStatus ? 1 : 0) +
      (schoolName ? 1 : 0) +
      (graduationDate ? 1 : 0)) *
      20
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        name,
      };

      if (dateOfBirth) {
        payload.date_of_birth = dateOfBirth.toISOString();
      }

      if (educationStatus) {
        payload.education_status = educationStatus;
      }

      if (schoolName) {
        payload.school_name = schoolName;
      }

      if (graduationDate) {
        payload.graduation_date = graduationDate.toISOString();
      }

      const response = await fetch(
        buildApiUrl(apiRoutes.completeProfile),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to complete profile');
      }

      const data = await response.json();

      // Update local state with saved data
      if (data.name) setName(data.name);
      if (data.date_of_birth) {
        setDateOfBirth(new Date(data.date_of_birth));
      }
      if (data.education_status !== undefined) {
        setEducationStatus(data.education_status || '');
      }
      if (data.school_name !== undefined) {
        setSchoolName(data.school_name || '');
      }
      if (data.graduation_date) {
        setGraduationDate(new Date(data.graduation_date));
      }

      // Show success message
      alert('Профиль успешно сохранен!');
      
      // If in edit mode, navigate back to profile page
      if (isEditMode && onNavigate) {
        // Reload user data first and update localStorage
        try {
          const token = accessToken || localStorage.getItem('naviq_access_token');
          if (token) {
            const profileResponse = await fetch(
              buildApiUrl(apiRoutes.profile),
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.profile) {
                // Update localStorage
                localStorage.setItem('naviq_user', JSON.stringify(profileData.profile));
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('profileUpdated', { 
                  detail: profileData.profile 
                }));
              }
            }
          }
        } catch (err) {
          console.error('Failed to reload profile:', err);
        }
        // Small delay to ensure data is saved before navigation
        setTimeout(() => {
          onNavigate('profile');
        }, 200);
      } else {
        // Call onComplete which should refresh user data and go to dashboard
        onComplete();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setError(error.message || 'Ошибка при сохранении профиля');
      alert('Ошибка при сохранении: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-12 text-white items-center justify-center">
        <div className="max-w-lg">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Rocket className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Начни свой карьерный путь
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Заполни профиль и получи персональные рекомендации от AI
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">AI-профориентация</div>
                <div className="text-sm opacity-90">
                  Персонализированный тест с рекомендациями
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Карьерные симуляции</div>
                <div className="text-sm opacity-90">
                  Реальный опыт от ведущих компаний
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Сертификаты</div>
                <div className="text-sm opacity-90">
                  Подтверждение навыков для резюме
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:p-8 overflow-visible relative isolate">
        <div className="w-full max-w-2xl overflow-visible relative isolate">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">NAVIQ</span>
            </div>

            <h1 className="text-4xl font-bold mb-2">
              {isEditMode ? 'Редактировать профиль' : 'Профиль'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isEditMode 
                ? 'Обнови информацию о себе для лучшего опыта'
                : `Профиль для ${user?.email || 'вашего аккаунта'}`}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Прогресс заполнения
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <Card className="relative isolate p-6 sm:p-8 shadow-xl border border-gray-100 overflow-visible">
            <form onSubmit={handleSubmit} className="space-y-8 overflow-visible relative isolate">
              {/* Имя */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Имя *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                  className="h-12 text-base border-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Дата рождения */}
              <div className="space-y-2 relative z-20 isolate">
                <Label htmlFor="date_of_birth" className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                  Дата рождения
                </Label>
                <p className="text-xs text-gray-500 -mt-1">
                  Только для проверки возраста. Мы не передаем эту информацию третьим лицам.
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-12 border-2 hover:border-green-500 hover:bg-green-50 relative z-10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? (
                        <span className="text-gray-900">{formatDate(dateOfBirth)}</span>
                      ) : (
                        <span className="text-gray-500">Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto max-w-[95vw] p-0 bg-transparent border-0 shadow-none"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={(date) => {
                          if (date) {
                            setDateOfBirth(date);
                          }
                        }}
                        month={dobMonth}
                        onMonthChange={(month) => setDobMonth(month)}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(23, 59, 59, 999);
                          const minDate = new Date('1900-01-01');
                          return date > today || date < minDate;
                        }}
                        fromYear={1900}
                        toYear={currentYear}
                        className="w-[320px]"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Статус обучения */}
              <div className="space-y-2 relative z-20 isolate">
                <Label htmlFor="education_status" className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  Текущий / прошлый статус обучения или карьеры
                </Label>
                <Select
                  value={educationStatus}
                  onValueChange={setEducationStatus}
                >
                  <SelectTrigger className="h-12 text-base border-2 focus:border-green-500 focus:ring-green-500 relative z-10">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper"
                    sideOffset={12}
                    avoidCollisions={true}
                    collisionPadding={16}
                  >
                    <SelectItem value="university">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Университет
                      </div>
                    </SelectItem>
                    <SelectItem value="college">Колледж</SelectItem>
                    <SelectItem value="high_school">Средняя школа</SelectItem>
                    <SelectItem value="graduate">Выпускник</SelectItem>
                    <SelectItem value="working">Работаю</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Название учебного заведения */}
              {educationStatus && educationStatus !== 'Не учусь' && (
                <div className="space-y-2 relative z-10 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="school_name" className="text-base font-semibold flex items-center gap-2">
                    <School className="w-4 h-4 text-green-600" />
                    Название учебного заведения
                  </Label>
                  <Input
                    id="school_name"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Например: МГУ, MIT, Stanford University"
                    className="h-12 text-base border-2 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              )}

              {/* Дата окончания */}
              {educationStatus && educationStatus !== 'Не учусь' && (
                <div className="space-y-2 relative z-20 animate-in slide-in-from-top-2 duration-300 isolate">
                  <Label htmlFor="graduation_date" className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-green-600" />
                    Ожидаемая дата окончания обучения
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-12 border-2 hover:border-green-500 hover:bg-green-50 relative z-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {graduationDate ? (
                          <span className="text-gray-900">{formatDate(graduationDate, 'month')}</span>
                        ) : (
                          <span className="text-gray-500">Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                  <PopoverContent
                    className="w-auto max-w-[95vw] p-0 bg-transparent border-0 shadow-none"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={true}
                    collisionPadding={8}
                  >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                      <Calendar
                        mode="single"
                        selected={graduationDate}
                        onSelect={(date) => {
                          setGraduationDate(date);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        defaultMonth={
                          graduationDate ||
                          new Date(new Date().getFullYear() + 1, 0, 1)
                        }
                        fromYear={currentYear}
                        toYear={currentYear + 6}
                        className="w-[320px]"
                      />
                    </div>
                  </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Benefits Section */}
              {progress > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        Отлично! Ты на правильном пути
                      </div>
                      <div className="text-sm text-gray-600">
                        После заполнения профиля ты получишь доступ к персональным рекомендациям,
                        карьерным симуляциям и сертификатам
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Section */}
              <div className="pt-6 border-t border-gray-200">
                {!isEditMode && (
                  <p className="text-xs text-gray-600 mb-6 text-center">
                    Нажимая "Согласен и присоединиться", вы соглашаетесь с нашими{' '}
                    <a href="#" className="text-green-600 hover:text-green-700 font-medium underline">
                      Условиями использования
                    </a>{' '}
                    и{' '}
                    <a href="#" className="text-green-600 hover:text-green-700 font-medium underline">
                      Политикой конфиденциальности
                    </a>
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading || !name}
                >
                  {loading ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      {isEditMode ? 'Сохранить изменения' : 'Согласен и присоединиться'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
