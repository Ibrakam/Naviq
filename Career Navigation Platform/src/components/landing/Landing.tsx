import { ArrowRight, Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from '../ui/button';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Landing({ onLogin, onSignup }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">NAVIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onLogin}>
              Sign In
            </Button>
            <Button onClick={onSignup} className="bg-green-500 hover:bg-green-600">
              Start Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI Career Navigator</span>
          </div>
          <h1 className="text-5xl mb-6">
            AI That Guides You to Your Career
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Take a personalized career assessment with artificial intelligence,
            discover your career path and gain real experience through simulations
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={onSignup}
              size="lg"
              className="bg-green-500 hover:bg-green-600"
            >
              Take AI Test
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <h2 className="text-3xl text-center mb-12">How Naviq Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-3">AI Career Assessment</h3>
            <p className="text-gray-600">
              Take a test of 20-25 questions. Artificial intelligence will analyze
              your interests, skills, and values to find the perfect direction
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-3">Career Tracks</h3>
            <p className="text-gray-600">
              Get personalized recommendations for career tracks:
              Frontend, Data, Design, Marketing, and more
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-3">Real Simulations</h3>
            <p className="text-gray-600">
              Complete step-by-step cases from real companies. Earn certificates
              and add experience to your resume
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-green-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl mb-4">Start Your Journey Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have already found their direction
          </p>
          <Button
            onClick={onSignup}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            Start Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2025 Naviq. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
