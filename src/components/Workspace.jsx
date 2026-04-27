import React, { useState } from 'react';
import DesignEditor from './DesignEditor';
import ContentEditor from './ContentEditor';
import PreviewManager from './PreviewManager';
import ExportManager from './ExportManager';
import {
  Folder,
  Layout,
  Type,
  Eye,
  Download,
  CheckCircle2,
  MousePointer2,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const Workspace = ({ projectPath, setProjectPath, setProjectName, setProjectType }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [device, setDevice] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [devServerRunning, setDevServerRunning] = useState(false);
  const [devUrl, setDevUrl] = useState('http://localhost:3002');

  const handleImport = async () => {
    try {
      setLoading(true);
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

        // Auto-start dev server for live preview
        const devResult = await window.electronAPI.startDev(result.workDir);
        if (devResult.success) {
          if (devResult.url) setDevUrl(devResult.url);
          setDevServerRunning(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Import', icon: Folder, sub: 'Import project' },
    { id: 2, title: 'Design', icon: Layout, sub: 'Customize styles' },
    { id: 3, title: 'Content', icon: Type, sub: 'Edit content' },
    { id: 4, title: 'Preview', icon: Eye, sub: 'Test live' },
    { id: 5, title: 'Export', icon: Download, sub: 'Build & Zip' },
  ];

  const renderActivePanel = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="w-[380px] h-full flex-shrink-0 bg-brand-darker border-r border-gray-800 flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <h2 className="text-xl font-bold text-white mb-2">1. Import Website</h2>
            <p className="text-sm text-gray-500 mb-8">Select your Vite + React project folder to begin.</p>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center bg-brand-dark/50 hover:border-brand-gold/50 transition-all group">
              <div className="w-20 h-20 rounded-full border border-brand-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Folder className="w-10 h-10 text-brand-gold" />
              </div>
              <p className="text-sm text-gray-300 mb-8 max-w-[200px]">Drop your Vite + React project folder here or browse.</p>

              <button
                onClick={handleImport}
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-brand-gold text-black font-bold hover:bg-yellow-500 transition-all shadow-lg shadow-brand-gold/10 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Select Folder'}
              </button>
            </div>

            {projectPath && (
              <div className="mt-8 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-green-500 text-sm font-semibold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Project Loaded</span>
                </div>
                <div className="text-[10px] text-gray-500 truncate mb-4">
                  {projectPath}
                </div>
                <button
                  onClick={() => setActiveStep(2)}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                  Go to Design <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      case 2:
        return <div className="w-[450px] h-full flex-shrink-0 border-r border-gray-800 animate-in slide-in-from-left duration-300 overflow-hidden"><DesignEditor projectPath={projectPath} /></div>;
      case 3:
        return <div className="w-[450px] h-full flex-shrink-0 border-r border-gray-800 animate-in slide-in-from-left duration-300 overflow-hidden"><ContentEditor projectPath={projectPath} /></div>;
      case 4:
        return <div className="w-[380px] h-full flex-shrink-0 border-r border-gray-800 animate-in slide-in-from-left duration-300 overflow-hidden"><PreviewManager projectPath={projectPath} /></div>;
      case 5:
        return <div className="w-[380px] h-full flex-shrink-0 border-r border-gray-800 animate-in slide-in-from-left duration-300 overflow-hidden"><ExportManager projectPath={projectPath} /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Step Rail (Leftmost Toolbar) */}
      <div className="w-20 bg-brand-darker border-r border-gray-800 flex flex-col items-center py-8 gap-4 flex-shrink-0">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive ? 'bg-brand-gold text-black scale-110 shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-16 bg-brand-dark border border-gray-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50">
                {step.title}
              </div>
              {isActive && (
                <div className="absolute -left-1 w-1 h-6 bg-brand-gold rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Editor Panel */}
      {renderActivePanel()}

      {/* Center Preview Canvas */}
      <div className="flex-1 bg-brand-dark flex flex-col relative overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-brand-darker/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-brand-dark rounded-full border border-gray-800 p-1">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone },
              ].map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d.id)}
                    className={`p-1.5 rounded-full transition-all ${device === d.id ? 'bg-brand-gold text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            <div className="h-4 w-[1px] bg-gray-800" />
            <div className="text-xs text-gray-500 font-medium">
              Viewport: <span className="text-gray-300 font-bold">{device === 'desktop' ? '1440 x 900' : device === 'tablet' ? '768 x 1024' : '375 x 812'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-gray-800 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <MousePointer2 className="w-3.5 h-3.5" />
              Select Mode
            </button>
            <button
              onClick={() => {
                if (devServerRunning) window.open(devUrl, '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-xs font-bold text-brand-gold hover:bg-brand-gold/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Live
            </button>
          </div>
        </div>

        {/* The Canvas Area */}
        <div className="flex-1 p-4 overflow-auto bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px] flex justify-center items-center custom-scrollbar">
          <div
            className={`bg-[#0A0A0A] shadow-2xl overflow-hidden transition-all duration-500 origin-top flex flex-col
              ${device === 'desktop' 
                ? 'w-full h-full rounded-none border-none' 
                : device === 'tablet' 
                  ? 'w-[768px] max-w-full h-[1024px] max-h-full aspect-[768/1024] mx-auto rounded-2xl border border-gray-800' 
                  : 'w-[375px] max-w-full h-[812px] max-h-full aspect-[375/812] mx-auto rounded-2xl border border-gray-800'}`}
          >
            {/* Browser Header Mockup */}
            <div className="h-10 bg-[#151515] border-b border-gray-800 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
              </div>
              <div className="mx-auto flex items-center gap-2 px-3 py-1 bg-black/40 rounded-md border border-gray-800/50">
                <Search className="w-3 h-3 text-gray-600" />
                <span className="text-[10px] text-gray-500 font-mono">{devUrl}</span>
              </div>
            </div>

            {/* Site Content (Placeholder for actual preview) */}
            <div className="flex-1 p-0 animate-in fade-in duration-700 bg-white overflow-hidden flex flex-col">
              {projectPath ? (
                devServerRunning ? (
                  <iframe
                    src={devUrl}
                    className="w-full h-full border-none block outline-none m-0 p-0"
                    title="Live Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-10 bg-brand-dark">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/5 border border-brand-gold/20 text-brand-gold text-xs font-bold mb-6 animate-pulse">
                      <CheckCircle2 className="w-3 h-3" /> Starting Dev Server...
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Preparing Live Preview</h1>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Please wait a moment while we spin up your development server.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center mt-40 text-center px-10">
                  <div className="w-16 h-16 bg-brand-gray rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <MousePointer2 className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">No Project Imported</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Import a project from the toolbar on the left to start editing on this canvas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;