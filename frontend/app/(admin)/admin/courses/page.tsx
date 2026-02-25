"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { CourseLessonOut, CourseOut } from "@/types/api";

type LessonFormState = {
  order: string;
  title: string;
  description: string;
  youtubeUrl: string;
  homeworkPrompt: string;
};

const DEFAULT_LESSON_FORM: LessonFormState = {
  order: "1",
  title: "",
  description: "",
  youtubeUrl: "",
  homeworkPrompt: "",
};

const SKILL_FIELDS = [
  { key: "analytics", label: "Аналитика" },
  { key: "technical", label: "Технический навык" },
  { key: "communication", label: "Коммуникация" },
  { key: "problem_solving", label: "Решение задач" },
  { key: "teamwork", label: "Командная работа" },
  { key: "leadership", label: "Лидерство" },
  { key: "creativity", label: "Креативность" },
  { key: "time_management", label: "Тайм-менеджмент" },
  { key: "adaptability", label: "Адаптивность" },
  { key: "critical_thinking", label: "Критическое мышление" },
] as const;

type SkillKey = (typeof SKILL_FIELDS)[number]["key"];

const DEFAULT_SKILL_PERCENT: Record<SkillKey, number> = {
  analytics: 50,
  technical: 40,
  communication: 20,
  problem_solving: 30,
  teamwork: 10,
  leadership: 0,
  creativity: 10,
  time_management: 10,
  adaptability: 10,
  critical_thinking: 25,
};

function lessonToForm(lesson: CourseLessonOut): LessonFormState {
  return {
    order: String(lesson.order || 1),
    title: lesson.title || "",
    description: lesson.description || "",
    youtubeUrl: lesson.youtube_url || "",
    homeworkPrompt: lesson.homework_prompt || "",
  };
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonsSectionRef = useRef<HTMLDivElement | null>(null);

  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState("2");
  const [skillPercent, setSkillPercent] = useState<Record<SkillKey, number>>(DEFAULT_SKILL_PERCENT);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<CourseLessonOut[]>([]);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(DEFAULT_LESSON_FORM);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null);
  const [autoGenerateHomework, setAutoGenerateHomework] = useState(true);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLessonOut | null>(null);
  const [editForm, setEditForm] = useState<LessonFormState>(DEFAULT_LESSON_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [generatingEditHomework, setGeneratingEditHomework] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const activeSkillChips = useMemo(
    () =>
      SKILL_FIELDS.filter((item) => skillPercent[item.key] > 0)
        .sort((a, b) => skillPercent[b.key] - skillPercent[a.key])
        .slice(0, 5),
    [skillPercent],
  );

  const loadCourses = async () => {
    const data = await api.get<CourseOut[]>("/admin/courses");
    setCourses(data);
    if (selectedCourseId && !data.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(null);
      setLessons([]);
    }
  };

  const loadLessons = async (courseId: string) => {
    setLoadingLessons(true);
    try {
      const data = await api.get<CourseLessonOut[]>(`/admin/courses/${courseId}/lessons`);
      setLessons(data);
      const nextOrder = data.length ? Math.max(...data.map((lesson) => lesson.order)) + 1 : 1;
      setLessonForm((prev) => ({ ...prev, order: String(nextOrder) }));
    } catch (err) {
      setLessons([]);
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить уроки");
    } finally {
      setLoadingLessons(false);
    }
  };

  const generateLessonHomework = async (lessonId: string) => {
    if (!selectedCourseId) return null;
    const updated = await api.post<CourseLessonOut>(
      `/admin/courses/${selectedCourseId}/lessons/${lessonId}/generate-homework`,
      {},
    );
    return updated;
  };

  useEffect(() => {
    loadCourses().catch(() => undefined);
  }, []);

  useEffect(() => {
    const queryCourseId = searchParams.get("courseId");
    if (!queryCourseId) return;
    setSelectedCourseId(queryCourseId);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCourseId) return;
    loadLessons(selectedCourseId).catch(() => undefined);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId || !lessonsSectionRef.current) return;
    lessonsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedCourseId]);

  const createCourse = async () => {
    if (!title.trim()) {
      toast.error("Введите название курса");
      return;
    }
    setCreatingCourse(true);
    try {
      const skillTags = SKILL_FIELDS.reduce<Record<string, number>>((acc, item) => {
        const normalized = Math.max(0, Math.min(100, skillPercent[item.key])) / 100;
        if (normalized > 0) acc[item.key] = Number(normalized.toFixed(2));
        return acc;
      }, {});

      await api.post<CourseOut>("/admin/courses", {
        title: title.trim(),
        url: url.trim() || null,
        skill_tags: skillTags,
        difficulty: Number(difficulty) || 1,
        description: description.trim() || null,
      });

      setTitle("");
      setDescription("");
      setUrl("");
      setDifficulty("2");
      setSkillPercent(DEFAULT_SKILL_PERCENT);
      await loadCourses();
      toast.success("Курс создан");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create course failed");
    } finally {
      setCreatingCourse(false);
    }
  };

  const createLesson = async () => {
    if (!selectedCourseId) return;
    if (!lessonForm.title.trim()) {
      toast.error("Введите название урока");
      return;
    }
    setCreatingLesson(true);
    try {
      const lesson = await api.post<CourseLessonOut>(`/admin/courses/${selectedCourseId}/lessons`, {
        order: Math.max(1, Number(lessonForm.order) || 1),
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim() || null,
        youtube_url: lessonForm.youtubeUrl.trim() || null,
        homework_prompt: lessonForm.homeworkPrompt.trim() || null,
      });

      if (autoGenerateHomework && !lesson.homework_prompt) {
        await generateLessonHomework(lesson.id);
      }

      setLessonForm((prev) => ({ ...DEFAULT_LESSON_FORM, order: String((Number(prev.order) || 1) + 1) }));
      await loadLessons(selectedCourseId);
      toast.success(autoGenerateHomework ? "Урок добавлен, ДЗ сгенерировано" : "Урок добавлен");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось добавить урок");
    } finally {
      setCreatingLesson(false);
    }
  };

  const openEditLesson = (lesson: CourseLessonOut) => {
    setEditingLesson(lesson);
    setEditForm(lessonToForm(lesson));
  };

  const closeEditLesson = () => {
    setEditingLesson(null);
    setEditForm(DEFAULT_LESSON_FORM);
  };

  const saveEditedLesson = async () => {
    if (!selectedCourseId || !editingLesson) return;
    if (!editForm.title.trim()) {
      toast.error("Название урока не может быть пустым");
      return;
    }
    setSavingEdit(true);
    try {
      await api.patch<CourseLessonOut>(`/admin/courses/${selectedCourseId}/lessons/${editingLesson.id}`, {
        order: Math.max(1, Number(editForm.order) || 1),
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        youtube_url: editForm.youtubeUrl.trim() || null,
        homework_prompt: editForm.homeworkPrompt.trim() || null,
      });
      await loadLessons(selectedCourseId);
      closeEditLesson();
      toast.success("Урок обновлён");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось обновить урок");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Шаг 1. Создание курса</CardTitle>
          <CardDescription>Заполни базовые поля и укажи навыки курса без JSON.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="course-title">Название курса</Label>
                <Input
                  id="course-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Frontend Architecture with React"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-description">Описание</Label>
                <Textarea
                  id="course-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Чему научится студент после прохождения курса"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course-url">Internal URL (опционально)</Label>
                  <Input
                    id="course-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/courses/frontend-react"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сложность</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выбери уровень" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Beginner</SelectItem>
                      <SelectItem value="2">2 - Basic</SelectItem>
                      <SelectItem value="3">3 - Intermediate</SelectItem>
                      <SelectItem value="4">4 - Advanced</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-zinc-100">Навыки, которые развивает курс</p>
              <p className="text-xs text-zinc-400">Поставь вес от 0 до 100. 0 = навык не покрывается.</p>
              <div className="space-y-2">
                {SKILL_FIELDS.map((item) => (
                  <div key={item.key} className="grid grid-cols-[1fr,90px] gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-300">{item.label}</p>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={skillPercent[item.key]}
                        onChange={(e) =>
                          setSkillPercent((prev) => ({
                            ...prev,
                            [item.key]: Number(e.target.value),
                          }))
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
                      />
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={skillPercent[item.key]}
                      onChange={(e) =>
                        setSkillPercent((prev) => ({
                          ...prev,
                          [item.key]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {activeSkillChips.length ? (
                activeSkillChips.map((item) => (
                  <span
                    key={item.key}
                    className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200"
                  >
                    {item.label}: {skillPercent[item.key]}%
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Пока ни один навык не выбран.</span>
              )}
            </div>
            <Button disabled={creatingCourse || !title.trim()} onClick={createCourse}>
              {creatingCourse ? "Создание..." : "Создать курс"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Шаг 2. Список курсов</CardTitle>
          <CardDescription>Нажми “Управлять уроками” и страница прокрутится к блоку уроков.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Сложность</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className={selectedCourseId === course.id ? "bg-cyan-300/5" : undefined}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.difficulty}</TableCell>
                  <TableCell className="max-w-56 truncate text-xs text-zinc-400">{course.url || "—"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        router.push(`/admin/courses?courseId=${course.id}`);
                      }}
                    >
                      Управлять уроками
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        try {
                          await api.delete<void>(`/admin/courses/${course.id}`);
                          await loadCourses();
                          toast.success("Курс удалён");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Delete failed");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCourse ? (
        <div ref={lessonsSectionRef}>
          <Card>
            <CardHeader>
              <CardTitle>Шаг 3. Уроки курса: {selectedCourse.title}</CardTitle>
              <CardDescription>Добавляй видео-уроки и домашки. AI может сгенерировать ДЗ автоматически.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="lesson-order">Порядок</Label>
                  <Input
                    id="lesson-order"
                    value={lessonForm.order}
                    type="number"
                    min={1}
                    onChange={(e) => setLessonForm((prev) => ({ ...prev, order: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lesson-title">Название урока</Label>
                  <Input
                    id="lesson-title"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="React state management and Zustand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-youtube">Ссылка на YouTube</Label>
                <Input
                  id="lesson-youtube"
                  value={lessonForm.youtubeUrl}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-description">Описание урока</Label>
                <Textarea
                  id="lesson-description"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Что студент изучит в этом уроке"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-homework">Текст ДЗ (опционально)</Label>
                <Textarea
                  id="lesson-homework"
                  value={lessonForm.homeworkPrompt}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, homeworkPrompt: e.target.value }))}
                  placeholder="Оставь пустым, чтобы сгенерировать AI"
                  rows={3}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={autoGenerateHomework}
                  onChange={(e) => setAutoGenerateHomework(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                Автоматически генерировать ДЗ через AI, если поле пустое
              </label>

              <Button disabled={creatingLesson || !lessonForm.title.trim()} onClick={createLesson}>
                {creatingLesson ? "Сохранение..." : "Добавить урок"}
              </Button>

              {loadingLessons ? (
                <p className="text-sm text-zinc-400">Loading lessons...</p>
              ) : lessons.length ? (
                <div className="space-y-3">
                  {lessons.map((lesson) => {
                    const rubric = lesson.homework_rubric as { must_include?: unknown } | null | undefined;
                    const keywords = Array.isArray(rubric?.must_include)
                      ? rubric.must_include.filter((value): value is string => typeof value === "string")
                      : [];
                    return (
                      <div key={lesson.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">
                              {lesson.order}. {lesson.title}
                            </p>
                            {lesson.youtube_url ? (
                              <a className="text-xs text-cyan-300 hover:text-cyan-200" href={lesson.youtube_url} target="_blank" rel="noreferrer">
                                {lesson.youtube_url}
                              </a>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditLesson(lesson)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyLessonId === lesson.id}
                              onClick={async () => {
                                setBusyLessonId(lesson.id);
                                try {
                                  await generateLessonHomework(lesson.id);
                                  await loadLessons(selectedCourse.id);
                                  toast.success("AI homework generated");
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Generate homework failed");
                                } finally {
                                  setBusyLessonId(null);
                                }
                              }}
                            >
                              <Sparkles className="h-4 w-4" />
                              Generate HW
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={busyLessonId === lesson.id}
                              onClick={async () => {
                                setBusyLessonId(lesson.id);
                                try {
                                  await api.delete<void>(`/admin/courses/${selectedCourse.id}/lessons/${lesson.id}`);
                                  await loadLessons(selectedCourse.id);
                                  toast.success("Урок удалён");
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Delete lesson failed");
                                } finally {
                                  setBusyLessonId(null);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        {lesson.description ? <p className="mt-2 text-sm text-zinc-300">{lesson.description}</p> : null}
                        {lesson.homework_prompt ? (
                          <p className="mt-2 text-xs text-zinc-400">
                            <span className="text-zinc-200">ДЗ:</span> {lesson.homework_prompt}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-zinc-500">ДЗ еще не задано.</p>
                        )}
                        {keywords.length ? (
                          <p className="mt-1 text-xs text-zinc-500">Ключевые слова проверки: {keywords.join(", ")}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No lessons yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Dialog open={Boolean(editingLesson)} onOpenChange={(open) => (!open ? closeEditLesson() : null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактирование урока</DialogTitle>
            <DialogDescription>Обнови поля урока, затем сохрани изменения.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-order">Порядок</Label>
                <Input
                  id="edit-lesson-order"
                  type="number"
                  min={1}
                  value={editForm.order}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, order: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-lesson-title">Название урока</Label>
                <Input
                  id="edit-lesson-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lesson-youtube">YouTube URL</Label>
              <Input
                id="edit-lesson-youtube"
                value={editForm.youtubeUrl}
                onChange={(e) => setEditForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lesson-description">Описание</Label>
              <Textarea
                id="edit-lesson-description"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lesson-homework">Домашнее задание</Label>
              <Textarea
                id="edit-lesson-homework"
                rows={4}
                value={editForm.homeworkPrompt}
                onChange={(e) => setEditForm((prev) => ({ ...prev, homeworkPrompt: e.target.value }))}
                placeholder="Можно оставить пустым и нажать Generate HW"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!editingLesson || generatingEditHomework}
              onClick={async () => {
                if (!editingLesson) return;
                setGeneratingEditHomework(true);
                try {
                  const updated = await generateLessonHomework(editingLesson.id);
                  if (updated) {
                    setEditForm((prev) => ({ ...prev, homeworkPrompt: updated.homework_prompt || "" }));
                  }
                  await loadLessons(selectedCourseId || "");
                  toast.success("ДЗ сгенерировано на основе видео/описания урока");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Generate homework failed");
                } finally {
                  setGeneratingEditHomework(false);
                }
              }}
            >
              <Sparkles className="h-4 w-4" />
              {generatingEditHomework ? "Генерация..." : "Generate HW"}
            </Button>
            <Button type="button" variant="outline" onClick={closeEditLesson}>
              Отмена
            </Button>
            <Button type="button" disabled={savingEdit} onClick={saveEditedLesson}>
              {savingEdit ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
