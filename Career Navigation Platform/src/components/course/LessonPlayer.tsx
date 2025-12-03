import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Menu,
  X,
  Trophy,
  Sparkles,
  BookOpen,
  Video,
  HelpCircle,
  PenTool,
  Lock,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { cn } from "../ui/utils";

import { VideoContent } from "./VideoContent";
import { TextContent, type TextContentProps } from "./TextContent";
import { QuizContent, type QuizQuestion } from "./QuizContent";
import { PracticeContent, type PracticeContentProps } from "./PracticeContent";
import { apiRoutes, buildApiUrl } from "../../utils/api";

// Types
export interface LessonContent {
  type: "video" | "text" | "quiz" | "practice";
  // Video
  videoUrl?: string;
  // Text
  text?: string;
  task?: TextContentProps["task"];
  resources?: TextContentProps["resources"];
  tools?: TextContentProps["tools"];
  // Quiz
  questions?: QuizQuestion[];
  // Practice
  practiceTitle?: string;
  practiceDescription?: string;
  practicePrompt?: string;
  keywords?: string[];
  hints?: string[];
  minLength?: number;
}

export interface Lesson {
  id: number;
  title: string;
  duration?: number;
  content: LessonContent;
  isCompleted?: boolean;
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
  isUnlocked?: boolean;
  unlocksSimulation?: string;
}

export interface CourseProgress {
  courseId: number;
  completedLessons: number[];
  totalXp: number;
  currentModuleId?: number;
  currentLessonId?: number;
}

export interface LessonPlayerProps {
  courseId: number;
  courseTitle: string;
  modules: Module[];
  initialModuleId?: number;
  initialLessonId?: number;
  accessToken: string;
  onBack: () => void;
  onCourseComplete?: () => void;
}

// Confetti component
function Confetti({ active }: { active: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];
    
    const colors = [
      "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"
    ];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
    
    let animationId: number;
    let frame = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      
      frame++;
      if (frame < 180) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [active]);
  
  if (!active) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}

// Content type icon
function getContentIcon(type: LessonContent["type"]) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "text":
      return <BookOpen className="h-4 w-4" />;
    case "quiz":
      return <HelpCircle className="h-4 w-4" />;
    case "practice":
      return <PenTool className="h-4 w-4" />;
  }
}

export function LessonPlayer({
  courseId,
  courseTitle,
  modules,
  initialModuleId,
  initialLessonId,
  accessToken,
  onBack,
  onCourseComplete,
}: LessonPlayerProps) {
  // State
  const [currentModuleIndex, setCurrentModuleIndex] = React.useState(() => {
    if (initialModuleId) {
      const idx = modules.findIndex(m => m.id === initialModuleId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  
  const [currentLessonIndex, setCurrentLessonIndex] = React.useState(() => {
    if (initialLessonId && initialModuleId) {
      const moduleIdx = modules.findIndex(m => m.id === initialModuleId);
      if (moduleIdx >= 0) {
        const lessonIdx = modules[moduleIdx].lessons.findIndex(l => l.id === initialLessonId);
        return lessonIdx >= 0 ? lessonIdx : 0;
      }
    }
    return 0;
  });
  
  const [completedLessons, setCompletedLessons] = React.useState<Set<number>>(() => {
    const completed = new Set<number>();
    modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.isCompleted) completed.add(l.id);
      });
    });
    return completed;
  });
  
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showModuleComplete, setShowModuleComplete] = React.useState(false);
  const [unlockedSimulation, setUnlockedSimulation] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [taskCompleted, setTaskCompleted] = React.useState(false);
  
  // Current module and lesson
  const currentModule = modules[currentModuleIndex];
  const rawLesson = currentModule?.lessons[currentLessonIndex];

  // Normalize lesson structure to handle database format
  const currentLesson = React.useMemo(() => {
    if (!rawLesson) return rawLesson;

    const lesson: any = { ...rawLesson };

    // If type is at lesson level but not in content, move it
    if ((lesson as any).type && !lesson.content.type) {
      lesson.content = {
        ...lesson.content,
        type: (lesson as any).type
      };
    }

    // Ensure text content is available at content.text
    if (!lesson.content.text && (lesson.content as any).text !== "") {
      // Check if there's text elsewhere in the structure
      console.log('Normalizing lesson content:', {
        hasContentText: 'text' in lesson.content,
        contentKeys: Object.keys(lesson.content),
        content: lesson.content
      });
    }

    return lesson;
  }, [rawLesson]);
  
  // Reset task completion when lesson changes
  React.useEffect(() => {
    setTaskCompleted(false);
  }, [currentModuleIndex, currentLessonIndex]);

  // Navigation helpers
  const isFirstLesson = currentModuleIndex === 0 && currentLessonIndex === 0;
  const isLastLessonOfModule = currentLessonIndex === currentModule?.lessons.length - 1;
  const isLastModule = currentModuleIndex === modules.length - 1;
  const isLastLesson = isLastModule && isLastLessonOfModule;

  const currentLessonCompleted = currentLesson ? completedLessons.has(currentLesson.id) : false;

  // Check if current lesson can be completed
  const canCompleteLesson = currentLessonCompleted || taskCompleted;
  
  // Calculate progress
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);
  
  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === "ArrowLeft" && !isFirstLesson) {
        handlePrevious();
      } else if (e.key === "ArrowRight" && !isLastLesson) {
        handleNext();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFirstLesson, isLastLesson, currentModuleIndex, currentLessonIndex]);
  
  // Auto-save progress every 30 seconds
  React.useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch(buildApiUrl(apiRoutes.courseProgress(courseId)), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentModuleId: currentModule?.id,
            currentLessonId: currentLesson?.id,
          }),
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    };
    
    const interval = setInterval(saveProgress, 30000);
    return () => clearInterval(interval);
  }, [courseId, currentModule?.id, currentLesson?.id, accessToken]);
  
  // Navigation handlers
  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
  };
  
  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    setSidebarOpen(false);
  };
  
  // Mark lesson complete
  const handleMarkComplete = async () => {
    if (!currentLesson || isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.lessonComplete(courseId, currentLesson.id)),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to complete lesson");
      
      const data = await response.json();
      
      // Update local state
      setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
      
      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Show XP toast
      toast.success(`+${data.xpEarned || 10} XP earned!`, {
        icon: <Sparkles className="h-4 w-4 text-amber-500" />,
        className: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
      });
      
      // Check if module is complete
      const moduleComplete = currentModule.lessons.every(
        l => l.id === currentLesson.id || completedLessons.has(l.id)
      );
      
      if (moduleComplete && isLastLessonOfModule) {
        setTimeout(() => {
          setShowModuleComplete(true);
          if (currentModule.unlocksSimulation) {
            setUnlockedSimulation(currentModule.unlocksSimulation);
          }
        }, 1500);
      } else if (!isLastLesson) {
        // Auto-navigate to next lesson
        setTimeout(handleNext, 1500);
      } else {
        // Course complete
        setTimeout(() => {
          onCourseComplete?.();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
      toast.error("Не удалось сохранить прогресс. Попробуйте еще раз.");
    } finally {
      setIsCompleting(false);
    }
  };
  
  // Render content based on type
  const renderContent = () => {
    if (!currentLesson) return null;

    const { content } = currentLesson;
    // Handle both data structures: type can be in content or at lesson level
    const lessonType = content.type || (currentLesson as any).type || "text";

    console.log('Rendering content:', {
      lessonType,
      contentType: content.type,
      currentLessonType: (currentLesson as any).type,
      hasText: !!content.text,
      textLength: content.text?.length || 0
    });

    switch (lessonType) {
      case "video":
        return (
          <VideoContent
            url={content.videoUrl || ""}
            title={currentLesson.title}
            onComplete={() => {
              if (!currentLessonCompleted) {
                toast.info("Видео просмотрено! Нажмите 'Отметить как пройденное' для получения XP.");
              }
            }}
          />
        );

      case "text":
        const textContent = content.text || "";
        console.log('Text content being passed:', { textContent, length: textContent.length });
        return (
          <TextContent
            content={textContent}
            task={content.task}
            resources={content.resources}
            tools={content.tools}
            lessonTitle={currentLesson.title}
            accessToken={accessToken}
            onTaskCompleted={setTaskCompleted}
          />
        );
        
      case "quiz":
        return (
          <QuizContent
            questions={content.questions || []}
            onComplete={(score, total) => {
              if (score === total && !currentLessonCompleted) {
                toast.success("Все ответы верны! Отличная работа!");
              }
            }}
          />
        );
        
      case "practice":
        return (
          <PracticeContent
            title={content.practiceTitle || "Практика"}
            description={content.practiceDescription || ""}
            prompt={content.practicePrompt || ""}
            keywords={content.keywords}
            hints={content.hints}
            minLength={content.minLength}
            onSubmit={() => {
              if (!currentLessonCompleted) {
                toast.info("Ответ отправлен! Нажмите 'Отметить как пройденное' для получения XP.");
              }
            }}
          />
        );
        
      default:
        return (
          <div className="p-4">
            <p>Unknown content type: {lessonType}</p>
            <p className="text-sm text-gray-400 mt-2">
              Debug: content.type={content.type}, currentLesson.type={currentLesson.type}
            </p>
          </div>
        );
    }
  };
  
  // Sidebar content
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-4 bg-[#0f1529]">
        <h2 className="font-semibold text-white line-clamp-2">{courseTitle}</h2>
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Прогресс курса</span>
            <span className="font-medium text-[#7B61FF]">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-white/10" />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 text-slate-200">
          {modules.map((module, moduleIdx) => (
            <div key={module.id}>
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium",
                moduleIdx === currentModuleIndex 
                  ? "text-[#9fb3ff]" 
                  : "text-slate-400"
              )}>
                {module.isUnlocked !== false ? (
                  <CheckCircle2 className={cn(
                    "h-4 w-4",
                    module.lessons.every(l => completedLessons.has(l.id))
                      ? "text-[#10B981]"
                      : "text-slate-500"
                  )} />
                ) : (
                  <Lock className="h-4 w-4 text-slate-600" />
                )}
                <span>Модуль {moduleIdx + 1}: {module.title}</span>
              </div>
              
              <div className="mt-2 ml-6 space-y-1">
                {module.lessons.map((lesson, lessonIdx) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  const isCurrent = moduleIdx === currentModuleIndex && lessonIdx === currentLessonIndex;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(moduleIdx, lessonIdx)}
                      disabled={module.isUnlocked === false}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all border border-transparent",
                        isCurrent
                          ? "bg-[#7B61FF]/10 text-white border-[#7B61FF]/40 shadow-[0_12px_30px_rgba(123,97,255,0.25)]"
                          : isCompleted
                          ? "text-slate-200 hover:bg-white/5"
                          : "text-slate-400 hover:bg-white/5",
                        module.isUnlocked === false && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                        isCompleted 
                          ? "bg-[#10B981]/20 text-[#10B981]"
                          : isCurrent
                          ? "bg-[#7B61FF]/40 text-white"
                          : "bg-white/10 text-slate-400"
                      )}>
                        {isCompleted ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          getContentIcon(lesson.content.type)
                        )}
                      </span>
                      <span className="flex-1 truncate">{lesson.title}</span>
                      {lesson.duration && (
                        <span className="text-xs text-slate-400">
                          {lesson.duration}м
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
  
  return (
    <div className="relative flex h-screen flex-col bg-[#0f1529] text-slate-100">
      {/* Confetti */}
      <Confetti active={showConfetti} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1529]/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: Back button and breadcrumb */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 text-white hover:bg-white/10"
              aria-label="Вернуться к курсу"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Breadcrumb className="hidden sm:flex text-slate-200">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onBack(); }}
                    className="max-w-[150px] truncate"
                  >
                    {courseTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="max-w-[150px] truncate">
                    {currentModule?.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {currentLesson?.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Right: Progress and menu */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-slate-300">
                {completedCount}/{totalLessons} уроков
              </span>
              <Progress value={progressPercent} className="w-24" />
            </div>
            
            {/* Mobile sidebar trigger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-[#0f1529] text-white">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Mobile breadcrumb */}
        <div className="border-t border-white/10 px-4 py-2 sm:hidden">
          <p className="text-sm text-slate-300 truncate">
            {currentModule?.title} → {currentLesson?.title}
          </p>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-[#0f1529]/80 lg:block">
          <SidebarContent />
        </aside>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 lg:px-10">
            <div className="rounded-3xl border border-white/10 bg-[#111a2f]/80 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-lg p-6 sm:p-8">
              {/* Lesson title */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                  {getContentIcon(currentLesson?.content.type || "text")}
                  <span className="uppercase tracking-wide text-xs text-[#9fb3ff]">
                    {currentLesson?.content.type === "video" && "Видео"}
                    {currentLesson?.content.type === "text" && "Теория"}
                    {currentLesson?.content.type === "quiz" && "Квиз"}
                    {currentLesson?.content.type === "practice" && "Практика"}
                  </span>
                  {currentLesson?.duration && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-200">{currentLesson.duration} мин</span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {currentLesson?.title}
                </h1>
              </div>
              
              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentModuleIndex}-${currentLessonIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-slate-100"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer navigation */}
      <footer className="sticky bottom-0 border-t border-white/10 bg-[#0f1529]/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstLesson}
            className="gap-2 border-white/15 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Предыдущий</span>
          </Button>
          
          <Button
            onClick={handleMarkComplete}
            disabled={currentLessonCompleted || isCompleting || !canCompleteLesson}
            className={cn(
              "gap-2 min-w-[200px] shadow-[0_10px_40px_rgba(123,97,255,0.35)]",
              currentLessonCompleted
                ? "bg-[#10B981]/20 text-[#d1f7e5] hover:bg-[#10B981]/25"
                : !canCompleteLesson
                ? "bg-gray-600/20 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            )}
            title={!canCompleteLesson && !currentLessonCompleted ? "Сначала выполните задание" : ""}
          >
            {currentLessonCompleted ? (
              <>
                <Check className="h-4 w-4" />
                Урок пройден
              </>
            ) : isCompleting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Сохранение...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {!canCompleteLesson ? "Выполните задание" : "Отметить как пройденное"}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={isLastLesson || (!currentLessonCompleted && !canCompleteLesson)}
            className="gap-2 border-white/15 text-white hover:bg-white/10"
            title={!currentLessonCompleted && !canCompleteLesson ? "Завершите текущий урок" : ""}
          >
            <span className="hidden sm:inline">Следующий</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
      
      {/* Module complete modal */}
      <Dialog open={showModuleComplete} onOpenChange={setShowModuleComplete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
              <Trophy className="h-10 w-10 text-amber-600" />
            </div>
            <DialogTitle className="text-2xl">Модуль завершен!</DialogTitle>
            <DialogDescription className="text-base">
              Поздравляем! Вы успешно завершили модуль "{currentModule?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-bold text-amber-600">+50 XP</span>
            </div>
            
            {unlockedSimulation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-violet-800">
                      Новая симуляция разблокирована!
                    </p>
                    <p className="text-sm text-violet-600">{unlockedSimulation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setShowModuleComplete(false);
                onBack();
              }}
              className="w-full sm:w-auto"
            >
              Вернуться к курсу
            </Button>
            {!isLastLesson && (
              <Button
                onClick={() => {
                  setShowModuleComplete(false);
                  handleNext();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                Следующий модуль
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
