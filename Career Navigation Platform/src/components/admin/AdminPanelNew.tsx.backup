import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminCourses } from './AdminCourses';
import { AdminSimulations } from './AdminSimulations';

interface AdminPanelNewProps {
  accessToken: string;
  onBack: () => void;
}

export function AdminPanelNew({ accessToken, onBack }: AdminPanelNewProps) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard accessToken={accessToken} />;
      case 'users':
        return <AdminUsers accessToken={accessToken} />;
      case 'courses':
        return <AdminCourses accessToken={accessToken} />;
      case 'simulations':
        return <AdminSimulations accessToken={accessToken} />;
      default:
        return <AdminDashboard accessToken={accessToken} />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onBackToDashboard={onBack}
    >
      {renderSection()}
    </AdminLayout>
  );
}
