import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BarChart3, Settings, Users, PenTool, Home, LogOut } from 'lucide-react';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface SidebarProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, currentPage }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/accounts', icon: Users, label: 'Accounts' },
    { path: '/create-post', icon: PenTool, label: 'Create Post' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">TheTribalSuite</h2>
        <p className="text-sm text-gray-600">Social Media Manager</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            <p className="text-xs text-green-600">Active</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLogout}
          className="w-full"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
