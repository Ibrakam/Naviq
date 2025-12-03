import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BookOpen, CheckCircle, Clock, Lock, Users, Play, Sparkles } from 'lucide-react';
import { apiRoutes, buildApiUrl } from '../../utils/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import { Progress } from '../ui/progress';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../ui/accordion';
import { Skeleton } from '../ui/skeleton';

interface CourseDetailProps {
  courseId: string;
  accessToken: string;
  user: any;
  onStartLesson: (lessonId?: string, moduleId?: string, courseTitle?: string, modules?: any[]) => void;
  onBack: () => void;
}

type LessonStatus = 'completed' | 'available' | 'locked';

interface CourseLesson {
  id: string;
  title: string;
  duration?: string;
  status?: LessonStatus;
  completed?: boolean;
  locked?: boolean;
  isLocked?: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

interface CourseSimulation {
  id: string;
  title: string;
  track?: string;
  difficulty?: string;
}

interface CourseDetailData {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  track?: string;
  level?: string;
  duration?: string;
  rating?: number;
  instructor?: {
    name?: string;
    title?: string;
  };
  stats?: {
    learners?: number;
  };
  modules?: CourseModule[];
  simulations?: CourseSimulation[];
}

interface CourseProgress {
  enrolled?: boolean;
  status?: string;
  completion?: number;
  percentage?: number;
  progress?: number;
  completedLessons?: string[];
  lockedLessons?: string[];
  unlockedSimulations?: string[];
}

export function CourseDetail({
  courseId,
  accessToken,
  onStartLesson,
  onBack,
}: CourseDetailProps) {
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(buildApiUrl(apiRoutes.course(courseId)), {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          fetch(buildApiUrl(apiRoutes.courseProgress(courseId)), {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        ]);

        if (!courseRes.ok) {
          throw new Error('Failed to load course details');
        }

        const courseData = await courseRes.json();
        const progressData = progressRes.ok ? await progressRes.json() : null;

        if (active) {
          // API returns 'content' field instead of 'modules'
          const course = courseData.course || courseData;
          if (course.content && !course.modules) {
            course.modules = course.content;
          }
          setCourse(course);
          setProgress(progressData?.progress || progressData);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Unable to load course data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [accessToken, courseId, reloadKey]);

  const completion = useMemo(() => {
    const value =
      Math.round(
        progress?.completion ??
          progress?.percentage ??
          progress?.progress ??
          0,
      ) || 0;
    return Math.min(100, Math.max(0, value));
  }, [progress]);

  const isEnrolled = useMemo(() => {
    return (
      progress?.enrolled ||
      progress?.status === 'enrolled' ||
      completion > 0
    );
  }, [completion, progress]);

  const lessonStatus = (lesson: CourseLesson): LessonStatus => {
    if (lesson.status) return lesson.status;
    if (lesson.completed || progress?.completedLessons?.includes(lesson.id)) {
      return 'completed';
    }
    if (lesson.locked || lesson.isLocked || progress?.lockedLessons?.includes(lesson.id)) {
      return 'locked';
    }
    return 'available';
  };

  const modules = course?.modules || [];
  const flatLessons = modules.flatMap((m) => m.lessons || []);
  const nextLesson = flatLessons.find((lesson) => lessonStatus(lesson) === 'available');

  const handleEnroll = async () => {
    setEnrolling(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl(apiRoutes.courseEnroll), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      });

      if (!res.ok) {
        throw new Error('Failed to enroll');
      }

      const data = await res.json();
      setProgress((prev) => ({
        ...prev,
        enrolled: true,
        completion: prev?.completion ?? 0,
        ...(data.progress || data),
      }));
    } catch (err: any) {
      setError(err.message || 'Unable to enroll right now');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStart = (lessonId?: string, moduleId?: string) => {
    if (lessonId && moduleId) {
      onStartLesson(lessonId, moduleId, course?.title, modules);
    } else if (nextLesson) {
      // Find the module that contains the next lesson
      const moduleWithNextLesson = modules.find((m) =>
        m.lessons.some((l) => l.id === nextLesson.id)
      );
      if (moduleWithNextLesson) {
        onStartLesson(nextLesson.id, moduleWithNextLesson.id, course?.title, modules);
      }
    }
  };

  const renderHero = () => {
    if (!course) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/5 via-transparent to-[#5B9FFF]/5" />

        <div className="relative grid lg:grid-cols-[1fr_400px] gap-8 p-8 md:p-12">
          {/* Left column - Course info */}
          <div className="flex flex-col gap-6">
            {/* Course image and badges */}
            <div className="flex flex-col sm:flex-row gap-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative h-52 w-52 rounded-2xl overflow-hidden shadow-xl flex-shrink-0"
              >
                {course.coverImage ? (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#7B61FF] via-[#5B9FFF] to-[#00E5A0]" />
                )}
              </motion.div>

              <div className="flex flex-col gap-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-2"
                >
                  {course.track && (
                    <Badge className="bg-white/90 backdrop-blur-sm border-0 text-slate-800 font-medium px-4 py-1">
                      {course.track}
                    </Badge>
                  )}
                  {course.level && (
                    <Badge className="bg-[#7B61FF] border-0 text-white font-medium px-4 py-1">
                      {course.level}
                    </Badge>
                  )}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900"
                >
                  {course.title}
                </motion.h1>

                {course.description && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-slate-600 text-base leading-relaxed"
                  >
                    {course.description}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap items-center gap-6 text-sm"
            >
              <span className="flex items-center gap-2 text-slate-600">
                <Award className="w-5 h-5 text-[#00E5A0]" />
                <span className="font-medium">
                  {course.rating ? `${(course.rating / 10).toFixed(1)} rating` : 'New course'}
                </span>
              </span>
              <span className="flex items-center gap-2 text-slate-600">
                <Users className="w-5 h-5 text-[#7B61FF]" />
                <span className="font-medium">
                  {course.stats?.learners ? `${course.stats.learners}+ learners` : 'Be first!'}
                </span>
              </span>
              <span className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5 text-[#5B9FFF]" />
                <span className="font-medium">{course.duration || 'Self-paced'}</span>
              </span>
            </motion.div>
          </div>

          {/* Right column - Progress card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 shadow-lg h-fit"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Your Progress</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{completion}%</p>
                </div>
                <Badge
                  className={
                    isEnrolled
                      ? 'bg-[#00E5A0] text-white border-0 px-4 py-1'
                      : 'bg-slate-200 text-slate-600 border-0 px-4 py-1'
                  }
                >
                  {isEnrolled ? 'Enrolled' : 'Not enrolled'}
                </Badge>
              </div>

              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] rounded-full"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">
                  {modules.length} modules • {flatLessons.length} lessons
                </span>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  className="w-full bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 shadow-lg shadow-[#7B61FF]/30 rounded-xl h-12 text-base font-semibold transition-all hover:scale-105"
                  onClick={() => (isEnrolled ? handleStart() : handleEnroll())}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    'Enrolling...'
                  ) : isEnrolled ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enroll Now
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="w-full text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Catalog
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderModules = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
          <CardTitle className="text-2xl font-bold text-slate-900">Course Modules</CardTitle>
          <CardDescription className="text-slate-600">
            Track your progress and jump into available lessons
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="space-y-4" defaultValue={modules[0]?.id}>
            {modules.map((module, moduleIndex) => {
              const lessons = module.lessons || [];
              const completedLessons = lessons.filter(
                (lesson) => lessonStatus(lesson) === 'completed',
              ).length;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + moduleIndex * 0.1 }}
                >
                  <AccordionItem
                    value={module.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-center justify-between w-full gap-4 text-left">
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-slate-900">{module.title}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {completedLessons}/{module.lessons.length} lessons completed
                          </p>
                        </div>
                        <Badge className="bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20 font-medium">
                          {module.lessons.length} lessons
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-3 mt-4">
                        {lessons.map((lesson, lessonIndex) => {
                          const status = lessonStatus(lesson);
                          return (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: lessonIndex * 0.05 }}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                {status === 'completed' && (
                                  <div className="bg-[#00E5A0] rounded-full p-1.5">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                {status === 'available' && (
                                  <div className="w-4 h-4 rounded-full border-2 border-[#7B61FF]" />
                                )}
                                {status === 'locked' && (
                                  <div className="bg-slate-200 rounded-full p-1.5">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{lesson.title}</p>
                                  <p className="text-sm text-slate-500 mt-0.5">
                                    {lesson.duration || 'Lesson'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {status === 'completed' && (
                                  <Badge className="bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/20 font-medium">
                                    Done
                                  </Badge>
                                )}
                                {status === 'available' && (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 shadow-md shadow-[#7B61FF]/30 rounded-lg px-6 transition-all hover:scale-105"
                                    onClick={() => handleStart(lesson.id, module.id)}
                                  >
                                    Start
                                  </Button>
                                )}
                                {status === 'locked' && (
                                  <Badge className="bg-slate-100 text-slate-500 border border-slate-200 font-medium">
                                    Locked
                                  </Badge>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSimulations = () => {
    const simulations = course?.simulations || [];
    if (!simulations.length) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
            <CardTitle className="text-2xl font-bold text-slate-900">Unlockable Simulations</CardTitle>
            <CardDescription className="text-slate-600">
              Complete at least 80% to unlock and practice in realistic scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {simulations.map((simulation) => {
                const unlocked =
                  completion >= 80 ||
                  progress?.unlockedSimulations?.includes(simulation.id);
                return (
                  <div
                    key={simulation.id}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-slate-900 text-lg">{simulation.title}</p>
                      <Badge
                        className={
                          unlocked
                            ? 'bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/20'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }
                      >
                        {unlocked ? 'Unlocked' : '80% required'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      {simulation.track || 'Simulation'} • {simulation.difficulty || 'Applied'}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 shadow-md shadow-[#7B61FF]/30 rounded-xl transition-all hover:scale-105"
                      disabled={!unlocked}
                      onClick={() => handleStart(simulation.id)}
                    >
                      Go to Simulation
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 w-full max-w-3xl px-6"
        >
          <Skeleton className="h-12 w-40 bg-white/10 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-3xl bg-white/10" />
          <Skeleton className="h-64 w-full rounded-3xl bg-white/10" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md text-center shadow-2xl"
        >
          <p className="text-xl text-slate-900 mb-6 font-semibold">{error}</p>
          <div className="flex flex-col gap-3">
            <Button
              className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 shadow-lg shadow-[#7B61FF]/30 rounded-xl"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              className="text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl"
              onClick={onBack}
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B9FFF]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl transition-all hover:scale-105 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to catalog
          </Button>
        </motion.div>

        {renderHero()}

        {modules.length > 0 && renderModules()}

        {renderSimulations()}
      </div>
    </div>
  );
}
