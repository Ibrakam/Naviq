import { useState, ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '../ui/button';

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onBackToDashboard: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'simulations', label: 'Simulations', icon: Layers },
];

export function AdminLayout({
  children,
  activeSection,
  onSectionChange,
  onBackToDashboard
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#0f1529] border-r border-gray-800 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="font-bold text-lg">Naviq Admin</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-gray-800 w-full"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`${sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Dashboard Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Button
            onClick={onBackToDashboard}
            variant="ghost"
            className={`w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <Home className={`${sidebarOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'}`} />
            {sidebarOpen && 'Back to Dashboard'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <div className="bg-[#0f1529] border-b border-gray-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your Naviq platform
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Administrator</p>
                <p className="text-xs text-gray-400">admin@naviq.com</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
