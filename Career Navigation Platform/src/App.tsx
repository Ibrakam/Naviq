import { useState, useEffect } from 'react';
import { apiRoutes, buildApiUrl } from './utils/api';
import { NewLanding } from './components/landing';
import { Login, Signup } from './components/auth';
import { Dashboard } from './components/dashboard';
import { AssessmentNew, AssessmentResults } from './components/assessment';
import { SimulationCatalog, SimulationPlayer } from './components/simulation';
import { CourseCatalog, CourseDetail, LessonPlayer } from './components/course';
import { Profile, CompleteProfile } from './components/profile';
import { AdminPanelNew } from './components/admin';
import { Toaster } from 'sonner';

type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'assessment'
  | 'assessment-results'
  | 'catalog'
  | 'simulation'
  | 'course-catalog'
  | 'course-detail'
  | 'lesson-player'
  | 'profile'
  | 'admin'
  | 'complete-profile';

// Protected pages that require authentication
const protectedPages: Page[] = ['dashboard', 'assessment', 'catalog', 'simulation', 'course-catalog', 'course-detail', 'lesson-player', 'profile', 'admin', 'complete-profile'];
const publicPages: Page[] = ['landing', 'login', 'signup'];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<{ title: string; modules: any[] } | null>(null);

  // Listen for profile updates and sync user state
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      if (event.detail) {
        setUser(event.detail);
        localStorage.setItem('naviq_user', JSON.stringify(event.detail));
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedToken = localStorage.getItem('naviq_access_token');
    const storedUser = localStorage.getItem('naviq_user');
    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      setAccessToken(storedToken);
      setUser(userData);
      // Don't override currentPage if it's already set (e.g., from URL)
      if (currentPage === 'landing') {
        // Auto-redirect admin to admin panel
        if (userData.role === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check authentication when navigating to protected pages
  useEffect(() => {
    const storedToken = localStorage.getItem('naviq_access_token');
    const hasToken = storedToken || accessToken;
    
    // If trying to access protected page without token, redirect to login immediately
    if (protectedPages.includes(currentPage) && !hasToken) {
      setCurrentPage('login');
    }
  }, [currentPage, accessToken]);

  const handleLogin = async (email: string, password: string, redirectPage: Page = 'dashboard') => {
    try {
      const response = await fetch(buildApiUrl(apiRoutes.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('naviq_access_token', data.accessToken);
      localStorage.setItem('naviq_user', JSON.stringify(data.user));

      // Auto-redirect admin to admin panel
      if (data.user.role === 'admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage(redirectPage);
      }
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(buildApiUrl(apiRoutes.signup), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // After signup, log in and redirect to assessment (career orientation)
      await handleLogin(email, password, 'assessment');
    } catch (error: any) {
      alert('Signup failed: ' + error.message);
    }
  };

  const handleCompleteProfile = async () => {
    // Reload user data and go to dashboard
    try {
      const token = accessToken || localStorage.getItem('naviq_access_token');
      if (!token) {
        setCurrentPage('dashboard');
        return;
      }
      
      const response = await fetch(buildApiUrl(apiRoutes.profile), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setUser(data.profile);
          localStorage.setItem('naviq_user', JSON.stringify(data.profile));
        }
      }
      
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Failed to reload profile:', error);
      // If profile fetch fails, just go to dashboard
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = async () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('naviq_access_token');
    localStorage.removeItem('naviq_user');
    setCurrentPage('landing');
  };

  const navigateTo = (page: Page, simulationId?: string, courseId?: string) => {
    if (simulationId) {
      setSelectedSimulation(simulationId);
    }
    if (courseId) {
      setSelectedCourse(courseId);
    }
    if (page === 'course-catalog') {
      setSelectedCourse(null);
    }
    setCurrentPage(page);
  };

  const handleStartCourseLesson = (lessonId?: string, moduleId?: string, courseTitle?: string, modules?: any[]) => {
    console.log('handleStartCourseLesson called', { lessonId, moduleId, courseTitle, modulesCount: modules?.length });
    if (lessonId && moduleId) {
      setSelectedLesson(lessonId);
      setSelectedModule(moduleId);
      if (courseTitle && modules) {
        console.log('Setting course data:', { title: courseTitle, modulesCount: modules.length });
        setCourseData({ title: courseTitle, modules });
      } else {
        console.warn('Missing courseTitle or modules!');
      }
      console.log('Navigating to lesson-player');
      setCurrentPage('lesson-player');
    } else {
      console.log('Missing lesson or module ID');
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen">
      {currentPage === 'landing' && (
        <NewLanding
          onLogin={() => navigateTo('login')}
          onSignup={() => navigateTo('signup')}
        />
      )}

      {currentPage === 'login' && (
        <Login
          onLogin={handleLogin}
          onSignup={() => navigateTo('signup')}
          onBack={() => navigateTo('landing')}
        />
      )}

      {currentPage === 'signup' && (
        <Signup
          onSignup={handleSignup}
          onLogin={() => navigateTo('login')}
          onBack={() => navigateTo('landing')}
        />
      )}

      {currentPage === 'complete-profile' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        const userData = user || (localStorage.getItem('naviq_user') ? JSON.parse(localStorage.getItem('naviq_user')!) : null);
        if (!token || !userData) return null;
        // Check if coming from profile page (edit mode) or from registration (new user)
        const isEditMode = userData.name && userData.date_of_birth;
        return (
          <CompleteProfile
            accessToken={token}
            user={userData}
            onComplete={handleCompleteProfile}
            isEditMode={isEditMode}
            onNavigate={navigateTo}
          />
        );
      })()}

      {currentPage === 'dashboard' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) {
          // Force redirect to login
          setCurrentPage('login');
          return null;
        }
        return (
          <Dashboard
            accessToken={token}
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );
      })()}

      {currentPage === 'assessment' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        // Use new assessment component with questions and answers
        return (
          <AssessmentNew
            accessToken={token}
            onComplete={() => navigateTo('assessment-results')}
            onBack={() => navigateTo('dashboard')}
          />
        );
      })()}

      {currentPage === 'assessment-results' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        return (
          <AssessmentResults
            accessToken={token}
            onBack={() => navigateTo('dashboard')}
            onStartSimulation={() => navigateTo('catalog')}
          />
        );
      })()}

      {currentPage === 'catalog' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        return (
          <SimulationCatalog
            accessToken={token}
            onSelectSimulation={(id) => navigateTo('simulation', id)}
            onBack={() => navigateTo('dashboard')}
          />
        );
      })()}

      {currentPage === 'course-catalog' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        return (
          <CourseCatalog
            accessToken={token}
            user={user}
            onSelectCourse={(id) => navigateTo('course-detail', undefined, id)}
            onBack={() => navigateTo('dashboard')}
          />
        );
      })()}

      {currentPage === 'course-detail' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        if (!selectedCourse) {
          navigateTo('course-catalog');
          return null;
        }
        return (
          <CourseDetail
            accessToken={token}
            courseId={selectedCourse}
            user={user}
            onStartLesson={handleStartCourseLesson}
            onBack={() => navigateTo('course-catalog')}
          />
        );
      })()}

      {currentPage === 'lesson-player' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        if (!selectedCourse || !selectedLesson || !selectedModule || !courseData) {
          navigateTo('course-catalog');
          return null;
        }
        return (
          <LessonPlayer
            accessToken={token}
            courseId={parseInt(selectedCourse)}
            courseTitle={courseData.title}
            modules={courseData.modules}
            initialModuleId={parseInt(selectedModule)}
            initialLessonId={parseInt(selectedLesson)}
            onBack={() => navigateTo('course-detail', undefined, selectedCourse)}
            onCourseComplete={() => {
              setSelectedLesson(null);
              setSelectedModule(null);
              setCourseData(null);
              navigateTo('course-detail', undefined, selectedCourse);
            }}
          />
        );
      })()}

      {currentPage === 'simulation' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        if (!selectedSimulation) {
          navigateTo('catalog');
          return null;
        }
        return (
          <SimulationPlayer
            accessToken={token}
            simulationId={selectedSimulation}
            onComplete={() => navigateTo('dashboard')}
            onBack={() => navigateTo('catalog')}
          />
        );
      })()}

      {currentPage === 'profile' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        const userData = user || (localStorage.getItem('naviq_user') ? JSON.parse(localStorage.getItem('naviq_user')!) : null);
        if (!token) {
          // Redirect will be handled by useEffect
          return null;
        }
        return (
          <Profile
            accessToken={token}
            user={userData}
            onBack={() => navigateTo('dashboard')}
            onNavigate={navigateTo}
          />
        );
      })()}

      {currentPage === 'admin' && (() => {
        const token = accessToken || localStorage.getItem('naviq_access_token');
        if (!token) return null;
        return (
          <AdminPanelNew
            accessToken={token}
            onBack={() => navigateTo('dashboard')}
          />
        );
      })()}
    </div>
    </>
  );
}
