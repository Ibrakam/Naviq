import { useState, useEffect } from 'react';
import { Plus, BookOpen, Edit, Trash2, Clock, BarChart, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface AdminCoursesProps {
  accessToken: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  track: string;
  duration: string;
  level: string;
  is_active: boolean;
  lessons_count: number;
  content: any[];
  created_at: string;
}

export function AdminCourses({ accessToken }: AdminCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    track: 'Frontend',
    duration: '4 weeks',
    level: 'Beginner',
    lessons_count: 0,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/courses', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...newCourse,
          content: [],
          is_active: true,
        }),
      });

      if (response.ok) {
        const createdCourse = await response.json();
        setCourses([...courses, createdCourse]);
        setShowCreateForm(false);
        setNewCourse({
          title: '',
          description: '',
          track: 'Frontend',
          duration: '4 weeks',
          level: 'Beginner',
          lessons_count: 0,
        });
        alert('Курс успешно создан!');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.detail || 'Не удалось создать курс'}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Ошибка при создании курса');
    }
  };

  const handleUpdateCourse = async (courseId: number) => {
    if (!editingCourse) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(editingCourse),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(courses.map(c => c.id === courseId ? updatedCourse : c));
        setEditingCourse(null);
        alert('Курс обновлен!');
      } else {
        alert('Ошибка при обновлении курса');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Ошибка при обновлении курса');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
        alert('Курс удален!');
      } else {
        alert('Ошибка при удалении курса');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Ошибка при удалении курса');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'from-green-500 to-green-600';
      case 'Intermediate':
        return 'from-blue-500 to-blue-600';
      case 'Advanced':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Загрузка курсов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление Курсами</h2>
          <p className="text-gray-400 mt-1">Создавайте и управляйте курсами, которые открывают доступ к симуляциям</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать Курс
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="bg-[#0f1529] border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Создать Новый Курс</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Название курса</Label>
                <Input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Например, Введение в веб-разработку"
                  className="bg-[#0a0f1e] border-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300">Трек</Label>
                <select
                  value={newCourse.track}
                  onChange={(e) => setNewCourse({ ...newCourse, track: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-gray-700 rounded-md text-white"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Data">Data Science</option>
                  <option value="Design">UX/UI Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <Label className="text-gray-300">Длительность</Label>
                <Input
                  type="text"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="Например, 4 недели"
                  className="bg-[#0a0f1e] border-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300">Уровень</Label>
                <select
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0f1e] border border-gray-700 rounded-md text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <Label className="text-gray-300">Количество уроков</Label>
                <Input
                  type="number"
                  value={newCourse.lessons_count}
                  onChange={(e) => setNewCourse({ ...newCourse, lessons_count: parseInt(e.target.value) || 0 })}
                  className="bg-[#0a0f1e] border-gray-700 text-white"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Описание</Label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Краткое описание курса..."
                className="bg-[#0a0f1e] border-gray-700 text-white"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="border-gray-700 text-gray-400 hover:text-white"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Создать Курс
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0f1529] border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Всего Курсов</span>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-white">{courses.length}</p>
        </Card>

        <Card className="bg-[#0f1529] border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Активных Курсов</span>
            <BarChart className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            {courses.filter((c) => c.is_active).length}
          </p>
        </Card>

        <Card className="bg-[#0f1529] border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Всего Уроков</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            {courses.reduce((sum, c) => sum + c.lessons_count, 0)}
          </p>
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card
              key={course.id}
              className="bg-[#0f1529] border-gray-800 p-6 hover:border-purple-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getLevelColor(course.level)} flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{course.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                        {course.track}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium bg-gradient-to-r ${getLevelColor(course.level)} text-white rounded-full`}>
                        {course.level}
                      </span>
                      {course.is_active && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full">
                          Активен
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-3">{course.description}</p>

                    <div className="flex items-center gap-6 text-white/60 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.lessons_count} уроков</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourse(course)}
                    className="border-gray-700 text-gray-400 hover:text-white hover:border-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="border-gray-700 text-gray-400 hover:text-white hover:border-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-[#0f1529] border-gray-800 p-12">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-white/70 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Курсов пока нет</p>
              <p className="text-white/60 text-sm mt-2">Создайте первый курс, чтобы начать</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
