import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Loader2 } from 'lucide-react';

const ComponentManager = ({ projectPath, selectedComponent, onSelect }) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComponents = async () => {
      if (!projectPath) return;
      setLoading(true);
      try {
        const res = await window.electronAPI.listComponents(projectPath);
        if (res.success) {
          setComponents(res.components.map((name) => ({ name })));
          // Select first component by default if none selected
          if (!selectedComponent && res.components.length > 0) {
            onSelect(res.components[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch components:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [projectPath]);

  return (
    <div className="w-48 flex flex-col gap-2 border-r border-gray-800 pr-4 overflow-hidden">
      <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Components</div>
      
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
            <Loader2 className="w-5 h-5 animate-spin text-brand-gold" />
            <span className="text-[10px] text-gray-500">Scanning...</span>
          </div>
        ) : components.length > 0 ? (
          components.map((c, i) => {
            const isActive = selectedComponent === c.name;
            return (
              <button 
                key={i} 
                onClick={() => onSelect(c.name)}
                className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-2 group
                  ${isActive ? 'bg-brand-gray text-brand-gold border border-brand-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutTemplate className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-gold' : 'text-gray-600 group-hover:text-gray-400'}`} />
                <span className="truncate">{c.name}</span>
              </button>
            );
          })
        ) : (
          <div className="py-10 text-center px-4">
            <p className="text-[10px] text-gray-600 italic">No components found in src/components</p>
          </div>
        )}
      </div>

      <button className="mt-2 text-brand-gold text-[10px] py-2 flex items-center justify-center gap-2 border border-brand-gold/20 rounded-lg hover:bg-brand-gold/5 transition-colors">
        <Plus className="w-3 h-3" />
        Add / Remove
      </button>
    </div>
  );
};

export default ComponentManager;
