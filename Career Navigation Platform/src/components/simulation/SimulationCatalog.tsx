import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Clock, BookOpen, Code, Server, BarChart3, Palette, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { apiRoutes, buildApiUrl } from '../../utils/api';

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

const trackColors: any = {
  frontend: { from: '#7B61FF', to: '#5B9FFF' },
  backend: { from: '#00E5A0', to: '#00B8D4' },
  data: { from: '#FF6B9D', to: '#C44569' },
  design: { from: '#FFA07A', to: '#FF6347' },
  marketing: { from: '#9B59B6', to: '#E74C3C' },
  product: { from: '#3498DB', to: '#2ECC71' },
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529]">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7B61FF]/50"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white/70">Loading simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B9FFF]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Simulation Catalog
          </motion.h1>
          <motion.p
            className="text-white/70 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Choose a simulation and get real work experience in your profession
          </motion.p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search simulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 border-white/30 focus:bg-white focus:border-[#7B61FF] transition-all"
              />
            </div>

            {/* Track Filter */}
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="px-4 py-2 bg-white/90 border border-white/30 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:bg-white transition-all"
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
              className="px-4 py-2 bg-white/90 border border-white/30 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:bg-white transition-all"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === 'All' ? 'All Levels' : diff}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Simulations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {infoMessage && (
          <motion.div
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/30 bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-xl p-4 text-amber-900 shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-xl">🔧</span>
            <div>{infoMessage}</div>
          </motion.div>
        )}
        {filteredSimulations.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Filter className="w-12 h-12 text-white/60" />
            </div>
            <h3 className="text-2xl mb-2 font-semibold">No simulations found</h3>
            <p className="text-white/70">
              Try changing the filters or search query
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulations.map((sim, index) => {
              const Icon = trackIcons[sim.track] || BookOpen;
              const colors = trackColors[sim.track] || { from: '#7B61FF', to: '#5B9FFF' };

              return (
                <motion.div
                  key={sim.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="group relative overflow-hidden bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                    onClick={() => onSelectSimulation(sim.id)}
                    style={{
                      boxShadow: `0 4px 20px rgba(123, 97, 255, 0.1)`,
                    }}
                  >
                    {/* Animated gradient overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${colors.from}15, ${colors.to}15)`,
                      }}
                    />

                    <div className="p-6 relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                            boxShadow: `0 4px 15px ${colors.from}40`,
                          }}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          {sim.company && (
                            <p className="text-sm text-slate-600 mb-1 font-medium truncate">
                              {sim.company}
                            </p>
                          )}
                          <motion.span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              sim.difficulty === 'Beginner'
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                : sim.difficulty === 'Intermediate'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {sim.difficulty}
                          </motion.span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-slate-800 line-clamp-2 group-hover:text-slate-900 transition-colors">
                        {sim.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {sim.description}
                      </p>

                      <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200/50">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{sim.duration}</span>
                        </span>
                        <motion.span
                          className="font-semibold bg-clip-text text-transparent"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {sim.steps?.length || 0} tasks
                        </motion.span>
                      </div>
                    </div>

                    {/* Bottom gradient border effect */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                      }}
                    />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
