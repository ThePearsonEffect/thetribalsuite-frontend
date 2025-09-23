import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PenTool, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Create Content', href: '/content', icon: PenTool },
    { name: 'Scheduled Posts', href: '/scheduled', icon: Calendar },
    { name: 'Accounts', href: '/accounts', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
      isOpen ? 'w-64' : 'w-16'
    } glass`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-4 py-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3 animate-fade-in">
              <h1 className="text-lg font-bold text-gradient">SocialSync</h1>
              <p className="text-xs text-gray-500">Social Media Hub</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                      ${!isOpen ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {isOpen && (
                      <span className="ml-3 animate-fade-in">{item.name}</span>
                    )}
                    {isActive && isOpen && (
                      <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade Banner */}
        {isOpen && (
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white animate-fade-in">
              <div className="flex items-center mb-2">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-semibold text-sm">Pro Features</span>
              </div>
              <p className="text-xs text-indigo-100 mb-3">
                Unlock advanced analytics and automation features
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Version */}
        {isOpen && (
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 animate-fade-in">Version 1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;