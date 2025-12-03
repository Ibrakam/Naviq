import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, BookOpen, CheckCircle, Clock, Users, Sparkles } from 'lucide-react';
import { apiRoutes, buildApiUrl } from '../../utils/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';

interface CourseCatalogProps {
  accessToken: string;
  user: any;
  onSelectCourse: (id: string) => void;
  onBack: () => void;
}

interface CourseProgress {
  completion?: number;
  progress?: number;
  percentage?: number;
  enrolled?: boolean;
  status?: string;
}

interface CourseItem {
  id: string;
  title: string;
  track: string;
  level: string;
  duration: string;
  rating?: number;
  image_url?: string;
  description?: string;
  learners?: number;
  progress?: CourseProgress;
  userProgress?: CourseProgress;
}

const tracks = [
  'All',
  'Marketing',
  'PM',
  'Data',
  'Finance',
  'HR',
  'Sales',
  'Project Mgmt',
  'Entrepreneurship',
];

export function CourseCatalog({ accessToken, onSelectCourse, onBack }: CourseCatalogProps) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>('All');

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildApiUrl(apiRoutes.courses), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load courses');
        }
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.items || data.courses || []);
        if (active) {
          setCourses(items);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Something went wrong while loading courses');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCourses();
    return () => {
      active = false;
    };
  }, [accessToken]);

  const filteredCourses = useMemo(() => {
    if (selectedTrack === 'All') return courses;
    const normalizedSelected = selectedTrack.toLowerCase().replace(/\s+/g, '');
    return courses.filter((course) => {
      const normalized = (course.track || '').toLowerCase().replace(/\s+/g, '');
      return normalized === normalizedSelected;
    });
  }, [courses, selectedTrack]);

  const getProgressInfo = (course: CourseItem) => {
    const progress = course.userProgress || course.progress;
    const completion = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          progress?.completion ??
            progress?.percentage ??
            progress?.progress ??
            0,
        ) || 0,
      ),
    );
    const enrolled =
      progress?.enrolled ||
      progress?.status === 'enrolled' ||
      completion > 0;
    return { completion, enrolled };
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card
          key={idx}
          className="overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
        >
          <Skeleton className="h-48 w-full rounded-xl bg-slate-200" />
          <Skeleton className="h-6 w-3/4 mt-6 bg-slate-200" />
          <Skeleton className="h-4 w-2/3 mt-3 bg-slate-200" />
          <Skeleton className="h-3 w-full mt-6 bg-slate-200" />
          <Skeleton className="h-11 w-32 mt-6 bg-slate-200" />
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] text-white relative overflow-hidden">
      {/* Background decorations matching Landing */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B9FFF]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Sparkles className="w-8 h-8 text-[#00E5A0]" />
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#d7cdff] to-white bg-clip-text text-transparent">
                Course Catalog
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/70 font-light"
            >
              Grow your skills with structured learning paths
            </motion.p>
          </div>
        </motion.div>

        {/* Track filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {tracks.map((track, index) => {
            const active = selectedTrack === track;
            return (
              <motion.div
                key={track}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              >
                <Button
                  size="sm"
                  variant={active ? 'default' : 'ghost'}
                  onClick={() => setSelectedTrack(track)}
                  className={
                    active
                      ? 'bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 shadow-lg shadow-[#7B61FF]/30 rounded-xl px-6 transition-all hover:scale-105'
                      : 'border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 rounded-xl px-6 transition-all hover:scale-105'
                  }
                >
                  {track}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-sm text-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          renderSkeletons()
        ) : filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-[#7B61FF]" />
              <h3 className="text-2xl font-semibold mb-3">No courses yet</h3>
              <p className="text-white/70">Check back soon for courses in {selectedTrack}!</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTrack}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCourses.map((course, index) => {
                const { completion, enrolled } = getProgressInfo(course);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className="group overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 hover:border-[#7B61FF]/40 rounded-2xl shadow-xl hover:shadow-[0_25px_80px_rgba(123,97,255,0.35)] transition-all duration-500 cursor-pointer hover:-translate-y-2"
                      onClick={() => onSelectCourse(course.id)}
                    >
                      {/* Image section */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {course.image_url ? (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#7B61FF] via-[#5B9FFF] to-[#00E5A0]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                        {/* Badges */}
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <Badge className="bg-white/90 backdrop-blur-sm border-0 text-slate-800 font-medium">
                            {course.track}
                          </Badge>
                          <Badge className="bg-[#7B61FF] border-0 text-white font-medium">
                            {course.level}
                          </Badge>
                        </div>

                        {/* Enrolled checkmark */}
                        {enrolled && (
                          <div className="absolute right-4 top-4">
                            <div className="bg-[#00E5A0] rounded-full p-2 shadow-lg">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content section */}
                      <div className="p-6 space-y-4 bg-gradient-to-br from-white/90 to-white/70">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-[#7B61FF] transition-colors">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#7B61FF]" />
                            {course.duration || 'Self-paced'}
                          </span>
                          <span className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#00E5A0]" />
                            {course.rating ? (course.rating / 10).toFixed(1) : 'New'}
                          </span>
                        </div>

                        {/* Progress bar */}
                        {enrolled && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                              <span>Your Progress</span>
                              <span className="text-[#7B61FF]">{completion}%</span>
                            </div>
                            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completion}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] rounded-full"
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" />
                            {course.learners ? `${course.learners}+ learners` : 'Be first!'}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 shadow-lg shadow-[#7B61FF]/30 rounded-xl px-6 transition-all hover:scale-105"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCourse(course.id);
                            }}
                          >
                            {enrolled && completion > 0 ? 'Continue' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
