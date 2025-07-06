import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Network, 
  Upload, 
  Search, 
  BarChart3, 
  Settings, 
  Bot,
  X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'graph', label: 'Knowledge Graph', icon: Network, path: '/graph' },
    { id: 'upload', label: 'Upload Documents', icon: Upload, path: '/upload' },
    { id: 'search', label: 'Research Papers', icon: Search, path: '/search' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">IntelliGraph</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              AI-Powered Knowledge
            </h3>
            <p className="text-xs text-blue-700">
              Intelligent information retrieval using knowledge graphs and scholarly research.
            </p>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
