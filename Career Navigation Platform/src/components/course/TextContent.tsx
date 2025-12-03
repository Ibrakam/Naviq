import * as React from "react";
import DOMPurify from "dompurify";
import { BookOpen, Link2, Wrench, CheckCircle2, ExternalLink, Send, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { apiRoutes, buildApiUrl } from "../../utils/api";

export interface TextContentProps {
  content: string;
  task?: string | {
    title: string;
    description: string;
    steps?: string[];
  };
  resources?: (string | {
    title: string;
    url: string;
    type?: "article" | "video" | "documentation" | "tool";
  })[];
  tools?: (string | {
    name: string;
    description: string;
    url?: string;
  })[];
  className?: string;
  lessonTitle?: string;
  accessToken?: string;
  onTaskCompleted?: (completed: boolean) => void;
}

// Simple markdown-like rendering
function renderContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let codeBlock: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag 
          key={elements.length} 
          className={cn(
            "my-4 space-y-2 pl-6",
            listType === 'ol' ? "list-decimal" : "list-disc"
          )}
        >
          {currentList.map((item, i) => (
            <li key={i} className="text-slate-200 leading-relaxed">{item}</li>
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlock.length > 0) {
      elements.push(
        <div key={elements.length} className="my-4 overflow-hidden rounded-xl bg-slate-900 shadow-lg">
          {codeLanguage && (
            <div className="border-b border-slate-800 bg-slate-900 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-300">
                {codeLanguage}
              </span>
            </div>
          )}
          <pre className="overflow-x-auto p-4">
            <code className="text-sm text-emerald-400 font-mono">
              {codeBlock.join('\n')}
            </code>
          </pre>
        </div>
      );
      codeBlock = [];
      inCodeBlock = false;
      codeLanguage = '';
    }
  };

  lines.forEach((line, index) => {
    // Code block handling
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      return;
    }

    // Headers
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="mt-8 mb-4 text-xl font-bold text-white">
          {line.slice(4)}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-8 mb-4 text-2xl font-bold text-white">
          {line.slice(3)}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} className="mt-6 mb-4 text-3xl font-bold text-white">
          {line.slice(2)}
        </h1>
      );
      return;
    }

    // Lists
    if (line.match(/^\d+\.\s/)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(line.replace(/^\d+\.\s/, ''));
      return;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(line.slice(2));
      return;
    }

    // Regular paragraph
    if (line.trim()) {
      flushList();
      // Handle inline formatting with DOMPurify sanitization
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#fcd34d]">$1</code>');

      const sanitizedHtml = DOMPurify.sanitize(formattedLine, {
        ALLOWED_TAGS: ['strong', 'em', 'code'],
        ALLOWED_ATTR: ['class']
      });

      elements.push(
        <p
          key={index}
          className="my-4 text-slate-200 leading-relaxed text-[17px]"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }
  });

  flushList();
  flushCodeBlock();

  return elements;
}

function getResourceIcon(type?: string) {
  switch (type) {
    case "video":
      return "🎬";
    case "documentation":
      return "📚";
    case "tool":
      return "🔧";
    default:
      return "📄";
  }
}

export function TextContent({
  content,
  task,
  resources,
  tools,
  className,
  lessonTitle,
  accessToken,
  onTaskCompleted
}: TextContentProps) {
  const [answer, setAnswer] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [score, setScore] = React.useState<number | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  // Notify parent when task is completed
  React.useEffect(() => {
    if (onTaskCompleted) {
      // If there's no task, lesson is always completable
      if (!task) {
        onTaskCompleted(true);
      } else {
        // Task exists - only completable if submitted successfully
        onTaskCompleted(submitted);
      }
    }
  }, [submitted, task, onTaskCompleted]);

  const handleSubmit = async () => {
    // Базовая проверка
    if (answer.length < 50) {
      setFeedback("⚠️ Ответ слишком короткий. Напишите подробнее (минимум 50 символов).");
      return;
    }

    if (!accessToken) {
      setFeedback("⚠️ Ошибка авторизации. Перезагрузите страницу.");
      return;
    }

    setChecking(true);
    setFeedback(null);

    try {
      const taskDescription = typeof task === 'string' ? task : (task?.description || '');

      const response = await fetch(buildApiUrl(apiRoutes.aiGradeTask), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          lesson_title: lessonTitle || 'Урок',
          task_description: taskDescription,
          student_answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check answer');
      }

      const result = await response.json();

      setScore(result.score);
      setFeedback(result.feedback);
      setSuggestions(result.suggestions || []);
      setSubmitted(result.is_passing);

    } catch (error: any) {
      setFeedback(`⚠️ Ошибка при проверке: ${error.message}. Попробуйте позже.`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Main content */}
      <div className="prose prose-invert max-w-none">
        {renderContent(content)}
      </div>

      {/* Task section */}
      {task && (
        <Card className="border border-amber-200/30 bg-gradient-to-br from-[#1f2b46] to-[#141c33] backdrop-blur-lg relative">
          {!submitted && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-400/50 animate-pulse">
                Обязательно
              </Badge>
            </div>
          )}
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <BookOpen className="h-5 w-5" />
              {typeof task === 'string' ? 'Практическое задание' : (task.title || "Практическое задание")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeof task === 'string' ? (
              <div
                className="prose prose-invert prose-sm max-w-none text-amber-100/90"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(task.replace(/\n/g, '<br/>'), {
                    ALLOWED_TAGS: ['br', 'strong', 'em', 'p'],
                    ALLOWED_ATTR: []
                  })
                }}
              />
            ) : (
              <>
                <p className="text-amber-100/90 leading-relaxed">{task.description}</p>
                {task.steps && task.steps.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-amber-200">Шаги выполнения:</h4>
                    <ul className="space-y-2">
                      {task.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                          <span className="text-amber-100/90">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Answer submission form - only show if task exists */}
      {task && (
        <Card className="border border-[#7B61FF]/40 bg-gradient-to-br from-[#161e38] via-[#0f1529] to-[#131b31] backdrop-blur-lg shadow-lg shadow-[#7B61FF]/15">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[#cdd3ff]">
              <Send className="h-5 w-5" />
              Ваш ответ на задание
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Напишите ваш ответ здесь... (минимум 50 символов)"
              disabled={submitted}
              className="w-full min-h-[200px] p-4 rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:border-[#7B61FF] focus:ring-2 focus:ring-[#7B61FF]/40 outline-none resize-none disabled:bg-white/5 disabled:cursor-not-allowed"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {answer.length} / 50 символов минимум
              </span>

              <Button
                onClick={handleSubmit}
                disabled={submitted || checking || answer.length < 50}
                className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] hover:opacity-90 text-white disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    AI проверяет...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Проверено
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Проверить с AI
                  </>
                )}
              </Button>
            </div>

            {/* Score badge */}
            {score !== null && (
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "text-lg px-4 py-2",
                    score >= 90 ? "bg-green-600" :
                    score >= 70 ? "bg-blue-600" :
                    score >= 50 ? "bg-amber-600" :
                    "bg-red-600"
                  )}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Оценка: {score}/100
                </Badge>
                {submitted && (
                  <Badge className="bg-green-600">
                    ✅ Зачтено
                  </Badge>
                )}
              </div>
            )}

            {/* AI Feedback */}
            {feedback && (
              <div className={cn(
                "p-4 rounded-lg space-y-3 border",
                submitted
                  ? "bg-[#0f1f1a] text-[#c8f4e1] border-[#10B981]/30"
                  : "bg-[#2b2414] text-amber-100 border-amber-400/30"
              )}>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-200" />
                  <div className="flex-1">
                    <p className="font-medium mb-2">AI Feedback:</p>
                    <p className="text-sm whitespace-pre-wrap">{feedback}</p>
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-current/20">
                    <p className="font-medium mb-2">Рекомендации для улучшения:</p>
                    <ul className="space-y-1 text-sm">
                      {suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources section */}
      {resources && resources.length > 0 && (
        <Card className="border border-blue-300/30 bg-gradient-to-br from-[#0f1b30] via-[#0f1529] to-[#13203a] backdrop-blur-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[#bcd8ff]">
              <Link2 className="h-5 w-5" />
              Полезные ресурсы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {resources.map((resource, i) => {
                if (typeof resource === 'string') {
                  return (
                    <li key={i} className="flex items-start gap-2 text-slate-200">
                      <span className="mt-0.5">•</span>
                      <span>{resource}</span>
                    </li>
                  );
                }
                return (
                  <li key={i}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/5 border border-white/5"
                    >
                      <span className="text-xl">{getResourceIcon(resource.type)}</span>
                      <span className="flex-1 text-slate-100 group-hover:text-white">
                        {resource.title}
                      </span>
                      <ExternalLink className="h-4 w-4 text-[#7B61FF] opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tools section */}
      {tools && tools.length > 0 && (
        <Card className="border border-emerald-300/30 bg-gradient-to-br from-[#0e2b24] via-[#0f1529] to-[#103430] backdrop-blur-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[#c8f4e1]">
              <Wrench className="h-5 w-5" />
              Рекомендуемые инструменты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool, i) => {
                if (typeof tool === 'string') {
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-emerald-200/40 bg-white/5 p-4"
                    >
                      <p className="text-emerald-100 text-sm">{tool}</p>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-emerald-200/40 bg-white/5 p-4 transition-shadow hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-200/20 text-emerald-100 border border-emerald-200/40">
                        {tool.name}
                      </Badge>
                      {tool.url && (
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-200 hover:text-emerald-100"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-emerald-100/80">{tool.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
