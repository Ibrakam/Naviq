import { useState, useEffect } from 'react';
import { ArrowLeft, Award, Clock, Trophy, Target, Calendar, CheckCircle, XCircle, RotateCcw, Edit, AlertCircle, User, GraduationCap, School, Calendar as CalendarIcon, Info, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { apiRoutes, buildApiUrl } from '../utils/api';

interface ProfileProps {
  accessToken: string;
  user: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Loading profile...</p>
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
    <div className="min-h-screen bg-gray-50 overflow-visible">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 overflow-visible">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-visible">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl mb-2">{profile?.name || 'User'}</h1>
              <p className="text-gray-600 mb-4">{profile?.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile?.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-visible">
        {/* Profile Completion Alert */}
        {!profileComplete && (
          <Card className="mb-8 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-visible">
            <div className="p-6 overflow-visible">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Info className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Profile Incomplete
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Complete your profile information for a better platform experience
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Missing Information
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {missingFields.map((field) => (
                    <div
                      key={field}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700"
                    >
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleEditProfile}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-medium shadow-sm hover:shadow transition-all"
              >
                <Edit className="w-4 h-4 mr-2" />
                Complete Profile
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Profile Information Card */}
        <Card className="mb-8 bg-white border border-gray-200 overflow-visible">
          <div className="p-6 overflow-visible">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Personal Information
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditProfile}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-8 overflow-visible">
              <div className="space-y-6 overflow-visible">
                <div className="overflow-visible">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Name
                  </label>
                  <p className="text-gray-900 text-base">{profile?.name || 'Not specified'}</p>
                </div>
                <div className="overflow-visible">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <p className="text-gray-900 text-base">
                    {profile?.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString('en-US')
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="space-y-6 overflow-visible">
                <div className="overflow-visible">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Education Status
                  </label>
                  <p className="text-gray-900 text-base">{profile?.education_status || 'Not specified'}</p>
                </div>
                {profile?.education_status && profile.education_status !== 'Not studying' && (
                  <>
                    <div className="overflow-visible">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                        <School className="w-4 h-4" />
                        School Name
                      </label>
                      <p className="text-gray-900 text-base">{profile?.school_name || 'Not specified'}</p>
                    </div>
                    <div className="overflow-visible">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Graduation Date
                      </label>
                      <p className="text-gray-900 text-base">
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

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-3xl mb-1">{passedCount}</p>
            <p className="text-gray-600 text-sm">Completed Internships</p>
          </Card>

          <Card className="p-6 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <p className="text-3xl mb-1">{failedCount}</p>
            <p className="text-gray-600 text-sm">Failed Attempts</p>
          </Card>

          <Card className="p-6 text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl mb-1">{totalHours}h</p>
            <p className="text-gray-600 text-sm">Practice Hours</p>
          </Card>

          <Card className="p-6 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl mb-1">{profile?.recommendedTracks?.length || 0}</p>
            <p className="text-gray-600 text-sm">Tracks Unlocked</p>
          </Card>
        </div>

        {/* Assessment Results */}
        {profile?.assessmentCompleted && profile?.assessmentResults && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Your Career Tracks</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.assessmentResults.tracks.map((track: any, index: number) => (
                <Card key={track.id} className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{index === 0 ? '🎯' : '⭐'}</span>
                    </div>
                    <div>
                      <h3 className="text-lg">{track.name}</h3>
                      <p className="text-sm text-gray-600">
                        {index === 0 ? 'Primary Direction' : 'Alternative'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Certificates & Results */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Certificates & Results</h2>
          
          {simulationResults.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No completed internships yet</h3>
              <p className="text-gray-600">
                Start completing internships to earn certificates and gain experience
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(resultsBySimulation).map(([simId, result]: [string, any]) => {
                const simulation = simulations.find(s => s.id === simId);
                if (!simulation) return null;

                const allAttempts = simulationResults.filter((r: any) => r.simulationId === simId);
                const passed = result.passed;

                return (
                  <Card key={simId} className={`p-6 ${passed ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            passed ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {passed ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                          <div>
                            {simulation.company && (
                              <p className="text-sm text-gray-600">{simulation.company}</p>
                            )}
                            <h3 className="text-lg">{simulation.title}</h3>
                          </div>
                        </div>

                        <div className="ml-15 space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              passed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Result:</span>
                            <span className="">
                              {result.score} / {result.maxScore} points ({result.percentage || Math.round((result.score / result.maxScore) * 100)}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Completed:</span>
                            <span className="text-sm">
                              {new Date(result.completedAt).toLocaleDateString('en-US')} at {new Date(result.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {allAttempts.length > 1 && (
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">Attempts:</span>
                              <span className="text-sm">{allAttempts.length}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {passed ? (
                          <Button variant="outline" size="sm">
                            <Award className="w-4 h-4 mr-2" />
                            Download Certificate
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.reload()} // Simple way to restart
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* All Attempts History */}
        {simulationResults.length > Object.keys(resultsBySimulation).length && (
          <div>
            <h2 className="text-2xl mb-4">Attempt History</h2>
            <Card className="p-6">
              <div className="space-y-3">
                {simulationResults.map((result: any, index: number) => {
                  const simulation = simulations.find(s => s.id === result.simulationId);
                  if (!simulation) return null;

                  return (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="">{simulation.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(result.completedAt).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{result.score}/{result.maxScore}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
