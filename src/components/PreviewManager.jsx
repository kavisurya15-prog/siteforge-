import React, { useState } from 'react';
import { Globe, ExternalLink, Copy } from 'lucide-react';

const PreviewManager = ({ projectPath }) => {
  const [status, setStatus] = useState('Stopped');

  const handleStartPreview = async () => {
    if (!projectPath) return;
    setStatus('Starting...');
    try {
      const res = await window.electronAPI.startDev(projectPath);
      if (res.success) {
        setStatus('Running');
      } else {
        setStatus('Error');
      }
    } catch (err) {
      setStatus('Error');
    }
  };

  return (
    <div className="h-full bg-brand-darker flex flex-col p-6">
      <h2 className="text-lg font-semibold text-white mb-2">4. Preview in Browser</h2>
      <p className="text-sm text-gray-500 mb-6">Run the project and open in Chrome</p>

      <div className="flex-1 bg-[#151515] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center mb-4">
          <Globe className="w-6 h-6 text-brand-gold" />
        </div>
        <p className="text-sm text-gray-300 mb-6 px-4">
          Open your website in the browser to see live changes.
        </p>

        <button 
          onClick={handleStartPreview}
          disabled={!projectPath || status === 'Starting...'}
          className="bg-brand-gold hover:bg-yellow-500 text-black font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4 w-full disabled:opacity-50"
        >
          <span>Open in Browser</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <p className="text-xs text-gray-500 mb-4">This will start the dev server.</p>

        {status === 'Running' && (
          <div className="flex items-center gap-2 bg-brand-dark border border-gray-800 rounded-lg py-2 px-3 w-full group">
            <span className="text-xs text-gray-400 flex-1 text-left truncate">http://localhost:3002</span>
            <button className="text-gray-500 hover:text-white transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {status !== 'Stopped' && status !== 'Running' && (
          <div className="text-xs text-brand-gold mt-2">Status: {status}</div>
        )}
      </div>
    </div>
  );
};

export default PreviewManager;
