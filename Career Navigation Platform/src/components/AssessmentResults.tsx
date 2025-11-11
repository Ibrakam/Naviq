import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { apiRoutes, buildApiUrl } from '../utils/api';
import { CareerResultPage } from './Assessment';

interface AssessmentResultsProps {
  accessToken: string;
  onBack: () => void;
  onStartSimulation: () => void;
}

export function AssessmentResults({
  accessToken,
  onBack,
  onStartSimulation,
}: AssessmentResultsProps) {
  const [results, setResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeResult = (data: any) => {
    return {
      explanation: data.top_tracks?.[0]?.reason || data.explanation,
      primaryTrack: data.primary_track || data.top_tracks?.[0]?.track_id,
      tracks:
        data.top_tracks?.map((track: any, index: number) => ({
          id: track.track_id || track.name?.toLowerCase().replace(/\s+/g, '_') || `track-${index}`,
          name: track.name,
          match: track.match_percentage,
          description: track.description,
          reason: track.reason,
        })) || [],
      suggestedCourses:
        data.courses?.map((course: any) => ({
          title: course.name,
          platform: course.platform,
        })) || [],
      plan:
        Object.entries(data.development_plan || {}).map(([day, task]) => ({
          day,
          task,
        })) || [],
      recommendations: data.recommendations || [],
    };
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(buildApiUrl(apiRoutes.assessmentResult), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to load results');
        }
        const data = await response.json();
        setResults(normalizeResult(data));
      } catch (err: any) {
        setError(err.message || 'Error loading results');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] px-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl text-gray-700">Loading results...</h2>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Results Unavailable
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'It seems the test is not yet completed. Take the career assessment to see recommendations.'}
            </p>
            <Button onClick={onBack}>Return</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="mb-6 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium px-4 py-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <CareerResultPage results={results} onComplete={onStartSimulation} />
    </div>
  );
}
