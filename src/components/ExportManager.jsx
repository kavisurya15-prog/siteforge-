import React, { useState, useEffect } from 'react';
import { DownloadCloud } from 'lucide-react';

const ExportManager = ({ projectPath }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onExportProgress((msg) => {
        setProgress(msg);
      });
    }
  }, []);

  const handleExport = async () => {
    if (!projectPath) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setProgress('Starting export...');
    try {
      const res = await window.electronAPI.buildExport(projectPath);
      if (res.success) {
        setSuccess(`Exported to: ${res.path}`);
        setProgress('');
      } else {
        setError(res.error || 'Export failed');
        setProgress('');
      }
    } catch (err) {
      setError(err.message);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-brand-darker flex flex-col p-6">
      <h2 className="text-lg font-semibold text-white mb-2">5. Export</h2>
      <p className="text-sm text-gray-500 mb-6">Build the project and download dist</p>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-medium mb-2 text-sm">Build & Export</h3>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            We'll build your project using <code className="text-brand-gold bg-brand-gold/10 px-1 py-0.5 rounded">npm run build</code> and compress the <code className="text-brand-gold bg-brand-gold/10 px-1 py-0.5 rounded">dist</code> folder.
          </p>

          <div className="space-y-3 mb-6">
            {[
              { num: 1, text: 'Run Build (npm run build)' },
              { num: 2, text: 'Optimize Assets' },
              { num: 3, text: 'Compress dist Folder' },
              { num: 4, text: 'Download ZIP' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-brand-gold text-brand-gold flex items-center justify-center text-[10px] font-bold">
                  {step.num}
                </div>
                <span className="text-sm text-gray-300">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {progress && <div className="text-xs text-brand-gold mb-2 text-center">{progress}</div>}
          {error && <div className="text-xs text-red-500 mb-2 text-center">{error}</div>}
          {success && <div className="text-xs text-green-500 mb-2 text-center truncate" title={success}>{success}</div>}

          <button 
            onClick={handleExport}
            disabled={!projectPath || loading}
            className="w-full bg-brand-gold/10 border border-brand-gold hover:bg-brand-gold/20 text-brand-gold font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4 disabled:opacity-50"
          >
            <DownloadCloud className="w-5 h-5" />
            <span>{loading ? 'Processing...' : 'Build & Download ZIP'}</span>
          </button>
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            Only the dist folder will be compressed.<br />Ready to upload to any hosting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;
