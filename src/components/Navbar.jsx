import React from 'react';
import { ChevronDown, HelpCircle, Bell, Sun, Diamond } from 'lucide-react';

const Navbar = ({ projectName }) => {
  return (
    <div className="h-16 border-b border-gray-800 bg-brand-dark flex items-center justify-between px-8 pl-8 flex-shrink-0 drag-region">
      {/* Left side */}
      <div className="flex items-center gap-6 no-drag">
        <button className="flex items-center gap-2 hover:bg-white/5 py-1 px-2 rounded-md transition-colors">
          <span className="text-white font-medium">{projectName}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
        
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Saved</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5 text-gray-400 no-drag">
        <button className="hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="hover:text-white transition-colors">
          <Sun className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
          <div className="w-8 h-8 rounded-full bg-brand-gold text-black flex items-center justify-center font-bold text-sm">
            K
          </div>
          <span className="text-white font-medium text-sm">Kavi Surya</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
