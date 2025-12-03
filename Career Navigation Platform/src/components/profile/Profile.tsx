import { useState, useEffect } from 'react';
import { ArrowLeft, Award, Clock, Trophy, Target, Calendar, CheckCircle, XCircle, RotateCcw, Edit, AlertCircle, User, GraduationCap, School, Calendar as CalendarIcon, Info, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { apiRoutes, buildApiUrl } from '../../utils/api';

interface ProfileProps {
  accessToken: string;
  user: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

export function Profile({ accessToken, user, onBack, onNavigate }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = accessToken || localStorage.getItem('naviq_access_token');
    if (!token) {
      // Redirect to login if not authenticated
      if (onNavigate) {
        onNavigate('login');
      }
      setLoading(false);
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Reload profile when profileUpdated event is dispatched (e.g., after saving)
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Force reload profile data from server
      const token = accessToken || localStorage.getItem('naviq_access_token');
      if (token) {
        loadProfile();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const loadProfile = async () => {
    try {
      const profileRes = await fetch(
        buildApiUrl(apiRoutes.profile),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const profileData = await profileRes.json();
      setProfile(profileData.profile);

      // Load all simulations to get details
      const simsRes = await fetch(
        buildApiUrl(apiRoutes.simulations),
      );
      const simsData = await simsRes.json();
      const items = simsData.items || simsData.simulations || [];
      setSimulations(items);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication before rendering
  const token = accessToken || localStorage.getItem('naviq_access_token');
  if (!token) {
    // Redirect to login
    if (onNavigate) {
      onNavigate('login');
    }
    return null;
  }

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
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      profile.name &&
      profile.date_of_birth &&
      profile.education_status &&
      (profile.education_status === 'Not studying' || profile.school_name) &&
      (profile.education_status === 'Not studying' || profile.graduation_date)
    );
  };

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!profile?.name) missing.push('Name');
    if (!profile?.date_of_birth) missing.push('Date of birth');
    if (!profile?.education_status) missing.push('Education status');
    if (profile?.education_status && profile.education_status !== 'Not studying') {
      if (!profile?.school_name) missing.push('School name');
      if (!profile?.graduation_date) missing.push('Graduation date');
    }
    return missing;
  };

  const handleEditProfile = () => {
    if (onNavigate) {
      onNavigate('complete-profile');
    } else {
      setIsEditing(true);
    }
  };

  const simulationResults = profile?.simulationResults || [];
  const passedCount = simulationResults.filter((r: any) => r.passed).length;
  const failedCount = simulationResults.filter((r: any) => !r.passed).length;

  // Group results by simulation ID, get latest attempt
  const resultsBySimulation = simulationResults.reduce((acc: any, result: any) => {
    if (!acc[result.simulationId] || new Date(result.completedAt) > new Date(acc[result.simulationId].completedAt)) {
      acc[result.simulationId] = result;
    }
    return acc;
  }, {});

  const totalHours = Object.keys(resultsBySimulation).length * 4; // Average 4 hours per simulation
  const missingFields = getMissingFields();
  const profileComplete = isProfileComplete();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] text-white overflow-visible relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B9FFF]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 overflow-visible relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-visible">
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

          <div className="flex items-start gap-6">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#7B61FF]/40"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
            <div className="flex-1">
              <motion.h1
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {profile?.name || 'User'}
              </motion.h1>
              <motion.p
                className="text-white/70 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {profile?.email}
              </motion.p>
              <motion.div
                className="flex items-center gap-4 text-sm text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile?.createdAt).toLocaleDateString('en-US')}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-visible relative z-10">
        {/* Profile Completion Alert */}
        {!profileComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-8 group relative overflow-hidden bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 via-transparent to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-6 overflow-visible relative z-10">
                <div className="flex items-start gap-4 mb-6">
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Profile Incomplete
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Complete your profile information for a better platform experience
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                    Missing Information
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {missingFields.map((field, index) => (
                      <motion.div
                        key={field}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium shadow-sm"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] rounded-full"></div>
                        <span>{field}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleEditProfile}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] hover:from-[#6B51EF] hover:to-[#4B8FEF] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Complete Profile
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Profile Information Card */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="mb-8 group relative overflow-hidden bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 via-transparent to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-6 overflow-visible relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-6 h-6 text-[#7B61FF]" />
                  Personal Information
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditProfile}
                  className="border-[#7B61FF]/30 text-[#7B61FF] hover:bg-[#7B61FF]/10 hover:border-[#7B61FF] transition-all"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-8 overflow-visible">
                <div className="space-y-6 overflow-visible">
                  <div className="overflow-visible">
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Name
                    </label>
                    <p className="text-slate-800 text-base font-medium">{profile?.name || 'Not specified'}</p>
                  </div>
                  <div className="overflow-visible">
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4" />
                      Date of Birth
                    </label>
                    <p className="text-slate-800 text-base font-medium">
                      {profile?.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString('en-US')
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="space-y-6 overflow-visible">
                  <div className="overflow-visible">
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      Education Status
                    </label>
                    <p className="text-slate-800 text-base font-medium">{profile?.education_status || 'Not specified'}</p>
                  </div>
                  {profile?.education_status && profile.education_status !== 'Not studying' && (
                    <>
                      <div className="overflow-visible">
                        <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                          <School className="w-4 h-4" />
                          School Name
                        </label>
                        <p className="text-slate-800 text-base font-medium">{profile?.school_name || 'Not specified'}</p>
                      </div>
                      <div className="overflow-visible">
                        <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                          <CalendarIcon className="w-4 h-4" />
                          Graduation Date
                        </label>
                        <p className="text-slate-800 text-base font-medium">
                          {profile?.graduation_date
                            ? new Date(profile.graduation_date).toLocaleDateString('en-US')
                            : 'Not specified'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group relative overflow-hidden p-6 text-center bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircle className="w-7 h-7 text-white" />
              </motion.div>
              <motion.p
                className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {passedCount}
              </motion.p>
              <p className="text-slate-600 text-sm font-medium">Completed Internships</p>
            </Card>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group relative overflow-hidden p-6 text-center bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <XCircle className="w-7 h-7 text-white" />
              </motion.div>
              <motion.p
                className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                {failedCount}
              </motion.p>
              <p className="text-slate-600 text-sm font-medium">Failed Attempts</p>
            </Card>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group relative overflow-hidden p-6 text-center bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Clock className="w-7 h-7 text-white" />
              </motion.div>
              <motion.p
                className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {totalHours}h
              </motion.p>
              <p className="text-slate-600 text-sm font-medium">Practice Hours</p>
            </Card>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group relative overflow-hidden p-6 text-center bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl hover:shadow-[#7B61FF]/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#7B61FF]/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="w-7 h-7 text-white" />
              </motion.div>
              <motion.p
                className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                {profile?.recommendedTracks?.length || 0}
              </motion.p>
              <p className="text-slate-600 text-sm font-medium">Tracks Unlocked</p>
            </Card>
          </motion.div>
        </div>

        {/* Assessment Results */}
        {profile?.assessmentCompleted && profile?.assessmentResults && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Your Career Tracks</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.assessmentResults.tracks.map((track: any, index: number) => (
                <motion.div
                  key={track.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group relative overflow-hidden p-6 bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-center gap-4 relative z-10">
                      <motion.div
                        className="w-14 h-14 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-2xl">{index === 0 ? '🎯' : '⭐'}</span>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{track.name}</h3>
                        <p className="text-sm text-slate-600 font-medium">
                          {index === 0 ? 'Primary Direction' : 'Alternative'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates & Results */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Certificates & Results</h2>

          {simulationResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-12 text-center bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No completed internships yet</h3>
                <p className="text-slate-600">
                  Start completing internships to earn certificates and gain experience
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {Object.entries(resultsBySimulation).map(([simId, result]: [string, any], index: number) => {
                const simulation = simulations.find(s => s.id === simId);
                if (!simulation) return null;

                const allAttempts = simulationResults.filter((r: any) => r.simulationId === simId);
                const passed = result.passed;

                return (
                  <motion.div
                    key={simId}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`group relative overflow-hidden p-6 bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      passed ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500'
                    }`}>
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        passed
                          ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10'
                          : 'bg-gradient-to-br from-rose-500/10 to-red-500/10'
                      }`} />

                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <motion.div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                passed
                                  ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30'
                                  : 'bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/30'
                              }`}
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              {passed ? (
                                <CheckCircle className="w-7 h-7 text-white" />
                              ) : (
                                <XCircle className="w-7 h-7 text-white" />
                              )}
                            </motion.div>
                            <div>
                              {simulation.company && (
                                <p className="text-sm text-slate-600 font-medium">{simulation.company}</p>
                              )}
                              <h3 className="text-xl font-bold text-slate-800">{simulation.title}</h3>
                            </div>
                          </div>

                          <div className="ml-18 space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold text-slate-600">Status:</span>
                              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                                passed
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                  : 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30'
                              }`}>
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold text-slate-600">Result:</span>
                              <span className="text-slate-800 font-medium">
                                {result.score} / {result.maxScore} points ({result.percentage || Math.round((result.score / result.maxScore) * 100)}%)
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold text-slate-600">Completed:</span>
                              <span className="text-sm text-slate-700">
                                {new Date(result.completedAt).toLocaleDateString('en-US')} at {new Date(result.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {allAttempts.length > 1 && (
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-slate-600">Attempts:</span>
                                <span className="text-sm text-slate-700 font-medium">{allAttempts.length}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {passed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500"
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Download Certificate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.reload()} // Simple way to restart
                              className="border-rose-500/30 text-rose-600 hover:bg-rose-50 hover:border-rose-500"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Retake
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Attempts History */}
        {simulationResults.length > Object.keys(resultsBySimulation).length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Attempt History</h2>
            <Card className="p-6 bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border-white/30 shadow-xl">
              <div className="space-y-3">
                {simulationResults.map((result: any, index: number) => {
                  const simulation = simulations.find(s => s.id === result.simulationId);
                  if (!simulation) return null;

                  return (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-slate-200/50 last:border-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                    >
                      <div>
                        <p className="text-slate-800 font-medium">{simulation.title}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(result.completedAt).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-700 font-medium">{result.score}/{result.maxScore}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.passed
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            : 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
                        }`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
