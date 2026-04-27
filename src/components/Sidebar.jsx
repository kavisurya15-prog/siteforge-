import React from 'react';
import { LayoutDashboard, LayoutTemplate, MonitorPlay, Download, Settings, Diamond, ArrowRight } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Workspace', icon: LayoutTemplate },
    { name: 'Preview in Browser', icon: MonitorPlay },
    { name: 'Export', icon: Download },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-brand-darker border-r border-gray-800 flex flex-col pt-12">
      {/* App Logo */}
      <div className="px-6 mb-10 flex items-center gap-2">
        <Diamond className="w-8 h-8 text-brand-gold" />
        <span className="text-xl font-bold text-white tracking-wide">SiteForge</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.name;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => setCurrentView(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive 
                  ? 'bg-brand-gray text-brand-gold border border-brand-gold/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Need Help Card */}
      <div className="p-4 mt-auto mb-6">
        <div className="bg-[#1A150D] border border-brand-gold/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-brand-gold">👑</span>
            <h3 className="text-brand-gold font-semibold">Need Help?</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            View docs and tutorials to build your perfect website.
          </p>
          <button className="w-full bg-brand-gold hover:bg-yellow-500 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center justify-between transition-colors text-sm">
            <span>View Docs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 text-xs text-gray-600 flex justify-between items-center border-t border-gray-800 pt-4">
        <span>© 2024 SiteForge.</span>
      </div>
    </div>
  );
};

export default Sidebar;
