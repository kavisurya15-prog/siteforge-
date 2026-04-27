import React, { useState } from 'react';
import { Folder, UploadCloud, AlertCircle } from 'lucide-react';

const Dashboard = ({ setProjectPath, setProjectName, setProjectType, setCurrentView }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use electron API
      const path = await window.electronAPI.selectFolder();
      if (!path) {
        setLoading(false);
        return;
      }

      const result = await window.electronAPI.cloneProject(path);
      if (result.success) {
        setProjectPath(result.workDir);
        setProjectName?.(result.name);
        setProjectType?.(result.type);
        setCurrentView('Workspace');
      } else {
        setError(result.error || 'Failed to clone project');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto mt-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-3">Welcome to SiteForge</h1>
        <p className="text-gray-400">Import an existing Vite + React project to start customizing.</p>
      </div>

      <div className="bg-brand-darker border border-brand-gold/10 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-brand-gray rounded-full flex items-center justify-center mb-6">
          <Folder className="w-10 h-10 text-brand-gold" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Import Website</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Select a local folder containing your Vite + React project. We will create a safe working copy.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button 
          onClick={handleImport}
          disabled={loading}
          className="bg-brand-gold hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <UploadCloud className="w-5 h-5" />
          <span>{loading ? 'Importing...' : 'Select Project Folder'}</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
