import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Clock, BookOpen, Code, Server, BarChart3, Palette, TrendingUp, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { apiRoutes, buildApiUrl } from '../utils/api';

interface SimulationCatalogProps {
  accessToken: string;
  onSelectSimulation: (id: string) => void;
  onBack: () => void;
}

const trackIcons: any = {
  frontend: Code,
  backend: Server,
  data: BarChart3,
  design: Palette,
  marketing: TrendingUp,
  product: Target,
};

const tracks = [
  { id: 'all', name: 'All Tracks' },
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'data', name: 'Data Analytics' },
  { id: 'design', name: 'UX/UI Design' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'product', name: 'Product Management' },
];

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function SimulationCatalog({ accessToken, onSelectSimulation, onBack }: SimulationCatalogProps) {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const response = await fetch(
        buildApiUrl(apiRoutes.simulations)
      );
      const data = await response.json();
      const items = data.items || data.simulations || [];
      setSimulations(items);
      setInfoMessage(data.message || null);
    } catch (error) {
      console.error('Failed to load simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSimulations = simulations.filter((sim) => {
    const title = (sim.title || '').toLowerCase();
    const description = (sim.description || '').toLowerCase();
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      description.includes(searchQuery.toLowerCase());
    const matchesTrack = selectedTrack === 'all' || sim.track === selectedTrack;
    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      (sim.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesTrack && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Loading simulations...</p>
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
            Back to Dashboard
          </Button>

          <h1 className="text-3xl mb-2">Simulation Catalog</h1>
          <p className="text-gray-600">
            Choose a simulation and get real work experience in your profession
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search simulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Track Filter */}
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === 'All' ? 'All Levels' : diff}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Simulations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {infoMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-amber-900">
            <span className="text-xl">🔧</span>
            <div>{infoMessage}</div>
          </div>
        )}
        {filteredSimulations.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2">No simulations found</h3>
            <p className="text-gray-600">
              Try changing the filters or search query
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulations.map((sim) => {
              const Icon = trackIcons[sim.track] || BookOpen;
              return (
                <Card
                  key={sim.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectSimulation(sim.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      {sim.company && (
                        <p className="text-sm text-gray-600 mb-1">{sim.company}</p>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        sim.difficulty === 'Beginner'
                          ? 'bg-green-100 text-green-700'
                          : sim.difficulty === 'Intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {sim.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg mb-2">{sim.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {sim.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {sim.duration}
                    </span>
                    <span className="text-green-600">
                      {sim.steps?.length || 0} tasks
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
