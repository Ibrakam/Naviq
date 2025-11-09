import { useState, useEffect } from 'react';
import { ArrowLeft, Users, BookOpen, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { apiRoutes, buildApiUrl } from '../utils/api';

interface AdminPanelProps {
  accessToken: string;
  onBack: () => void;
}

export function AdminPanel({ accessToken, onBack }: AdminPanelProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSimulation, setNewSimulation] = useState({
    title: '',
    description: '',
    track: 'frontend',
    duration: '3-4 hours',
    difficulty: 'Beginner',
    steps: [] as any[],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.adminAnalytics),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimulation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.adminSimulations),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...newSimulation,
            steps: [
              {
                title: 'Introduction',
                description: 'Get familiar with the task',
                type: 'theory',
              },
              {
                title: 'Practice',
                description: 'Complete the exercise',
                type: 'practice',
              },
              {
                title: 'Review',
                description: 'Review your solution',
                type: 'review',
              },
            ],
          }),
        }
      );

      if (response.ok) {
        alert('Симуляция успешно создана!');
        setShowCreateForm(false);
        setNewSimulation({
          title: '',
          description: '',
          track: 'frontend',
          duration: '3-4 hours',
          difficulty: 'Beginner',
          steps: [],
        });
      } else {
        alert('Ошибка при создании симуляции');
      }
    } catch (error) {
      console.error('Failed to create simulation:', error);
      alert('Ошибка при создании симуляции');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к дашборду
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">Админ-панель</h1>
              <p className="text-gray-600">Управление платформой Naviq</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать симуляцию
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Аналитика</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Всего пользователей</span>
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl">{analytics?.totalUsers || 0}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Симуляций</span>
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl">{analytics?.totalSimulations || 0}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Пройденных тестов</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl">{analytics?.completedAssessments || 0}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Завершений</span>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl">{analytics?.totalCompletions || 0}</p>
            </Card>
          </div>
        </div>

        {/* Create Simulation Form */}
        {showCreateForm && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl mb-6">Создать новую симуляцию</h2>
            <form onSubmit={handleCreateSimulation} className="space-y-6">
              <div>
                <Label htmlFor="title">Название симуляции</Label>
                <Input
                  id="title"
                  value={newSimulation.title}
                  onChange={(e) =>
                    setNewSimulation({ ...newSimulation, title: e.target.value })
                  }
                  placeholder="Например: Build a REST API"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newSimulation.description}
                  onChange={(e) =>
                    setNewSimulation({ ...newSimulation, description: e.target.value })
                  }
                  placeholder="Краткое описание симуляции"
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="track">Трек</Label>
                  <select
                    id="track"
                    value={newSimulation.track}
                    onChange={(e) =>
                      setNewSimulation({ ...newSimulation, track: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="data">Data Analytics</option>
                    <option value="design">UX/UI Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="product">Product Management</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Уровень</Label>
                  <select
                    id="difficulty"
                    value={newSimulation.difficulty}
                    onChange={(e) =>
                      setNewSimulation({ ...newSimulation, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration">Длительность</Label>
                  <Input
                    id="duration"
                    value={newSimulation.duration}
                    onChange={(e) =>
                      setNewSimulation({ ...newSimulation, duration: e.target.value })
                    }
                    placeholder="2-3 hours"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  Создать симуляцию
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Platform Stats */}
        <Card className="p-8">
          <h2 className="text-2xl mb-6">Статистика платформы</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Конверсия в прохождение теста</span>
                <span className="">
                  {analytics?.totalUsers > 0
                    ? Math.round((analytics.completedAssessments / analytics.totalUsers) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      analytics?.totalUsers > 0
                        ? (analytics.completedAssessments / analytics.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Среднее завершений на пользователя</span>
                <span className="">
                  {analytics?.totalUsers > 0
                    ? (analytics.totalCompletions / analytics.totalUsers).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
