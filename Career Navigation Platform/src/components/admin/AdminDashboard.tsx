import { useEffect, useState } from 'react';
import { Users, BookOpen, Layers, TrendingUp, Award, Activity } from 'lucide-react';
import { Card } from '../ui/card';

interface AdminDashboardProps {
  accessToken: string;
}

interface DashboardStats {
  total_users: number;
  completed_assessments: number;
  active_simulations: number;
  issued_certificates: number;
  user_registrations_by_day: Array<{ date: string; count: number }>;
  popular_tracks: Array<{ track_id: number; submissions: number }>;
  completion_rates: { overall: number };
}

export function AdminDashboard({ accessToken }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <Card className="bg-[#0f1529] border-gray-800 p-6 hover:border-purple-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats?.total_users || 0}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Completed Assessments"
            value={stats?.completed_assessments || 0}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Layers}
            title="Active Simulations"
            value={stats?.active_simulations || 0}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Award}
            title="Issued Certificates"
            value={stats?.issued_certificates || 0}
            color="from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations */}
        <Card className="bg-[#0f1529] border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Registrations</h3>
          {stats?.user_registrations_by_day && stats.user_registrations_by_day.length > 0 ? (
            <div className="space-y-3">
              {stats.user_registrations_by_day.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{item.date}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${(item.count / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No registration data available</p>
          )}
        </Card>

        {/* Popular Tracks */}
        <Card className="bg-[#0f1529] border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Popular Tracks</h3>
          {stats?.popular_tracks && stats.popular_tracks.length > 0 ? (
            <div className="space-y-3">
              {stats.popular_tracks.map((track, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Track #{track.track_id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${Math.min((track.submissions / 50) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-8 text-right">{track.submissions}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No track data available</p>
          )}
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="bg-[#0f1529] border-gray-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Overall Completion Rate</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full"
                style={{ width: `${stats?.completion_rates?.overall || 0}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {stats?.completion_rates?.overall?.toFixed(1) || 0}%
            </p>
            <p className="text-gray-400 text-sm">Completion Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
