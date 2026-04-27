import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Type, Settings, Plus, MonitorPlay, ExternalLink, Copy } from 'lucide-react';

import ComponentManager from './ComponentManager';

const DesignEditor = ({ projectPath }) => {
  const [activeTab, setActiveTab] = useState('Style');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [config, setConfig] = useState({
    background: '#0D0D0D',
    textColor: '#FFFFFF',
    primaryColor: '#D4AF37',
    borderColor: '#2A2A2A',
    paddingY: '16',
    paddingX: '24'
  });

  useEffect(() => {
    const loadConfig = async () => {
      if (!projectPath || !selectedComponent) return;
      try {
        const res = await window.electronAPI.readConfig(projectPath);
        // If config exists for this component, load it, otherwise reset to defaults
        if (res.success && res.data && res.data[selectedComponent]) {
          setConfig({ ...config, ...res.data[selectedComponent] });
        } else {
          // Reset or keep defaults if no specific config found
          setConfig({
            background: '#0D0D0D',
            textColor: '#FFFFFF',
            primaryColor: '#D4AF37',
            borderColor: '#2A2A2A',
            paddingY: '16',
            paddingX: '24'
          });
        }
      } catch (err) {
        console.error('Failed to load component config:', err);
      }
    };
    loadConfig();
  }, [projectPath, selectedComponent]);

  const handleUpdate = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="h-full flex flex-col p-6 bg-brand-darker">
      <h2 className="text-lg font-semibold text-white mb-2">2. Customize Design</h2>
      <p className="text-sm text-gray-500 mb-6">Customize the appearance of your website</p>
 
      <div className="flex flex-1 overflow-hidden gap-4">
        {/* Component List */}
        <ComponentManager 
          projectPath={projectPath} 
          selectedComponent={selectedComponent}
          onSelect={setSelectedComponent}
        />
 
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">{selectedComponent || 'Select a Component'}</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Enable</span>
              <div className="w-8 h-4 bg-brand-gold rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-black rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>

          {selectedComponent && (
            <div className="bg-[#151515] p-4 rounded-xl border border-gray-800 mb-6 flex items-center justify-between animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-gold rounded text-black flex items-center justify-center text-[10px] font-bold">
                  {selectedComponent.charAt(0)}
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-tight">{selectedComponent}</div>
              </div>
              <div className="flex gap-2 text-[9px] text-gray-500 font-mono">
                <span>{config.paddingX}x{config.paddingY}</span>
                <span style={{ color: config.primaryColor }}>●</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-800 mb-6">
            {['Style', 'Layout', 'Advanced'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 
                  ${activeTab === t ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
 
          {/* Form Fields */}
          <div className="space-y-4">
            {[
              { id: 'background', label: 'Background', value: config.background },
              { id: 'textColor', label: 'Text Color', value: config.textColor },
              { id: 'primaryColor', label: 'Primary Color', value: config.primaryColor },
              { id: 'borderColor', label: 'Border Color', value: config.borderColor },
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">{field.label}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={field.value} 
                    onChange={(e) => handleUpdate(field.id, e.target.value)}
                    className="flex-1 bg-brand-dark border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" 
                  />
                  <div className="w-10 h-10 rounded-lg border border-gray-800 shadow-inner" style={{ backgroundColor: field.value }}></div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Padding (Y)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={config.paddingY} 
                    onChange={(e) => handleUpdate('paddingY', e.target.value)}
                    className="w-full bg-brand-dark border border-gray-800 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" 
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-500">px</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Padding (X)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={config.paddingX} 
                    onChange={(e) => handleUpdate('paddingX', e.target.value)}
                    className="w-full bg-brand-dark border border-gray-800 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" 
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-500">px</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 py-3 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold rounded-xl text-xs font-bold hover:bg-brand-gold/20 transition-all">
              Save Design Changes
            </button>
          </div>
 
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
