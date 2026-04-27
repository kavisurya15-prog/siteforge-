import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';

function App() {
  const [currentView, setCurrentView] = useState('Workspace');
  const [projectPath, setProjectPath] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [projectType, setProjectType] = useState(null);

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard 
          setProjectPath={setProjectPath} 
          setProjectName={setProjectName}
          setProjectType={setProjectType}
          setCurrentView={setCurrentView} 
        />;
      case 'Workspace':
        return <Workspace 
          projectPath={projectPath} 
          setProjectPath={setProjectPath}
          setProjectName={setProjectName}
          setProjectType={setProjectType}
        />;
      case 'Preview':
        return <div className="p-8"><h1 className="text-2xl font-bold">Preview (Coming Soon)</h1></div>;
      case 'Export':
        return <div className="p-8"><h1 className="text-2xl font-bold">Export (Coming Soon)</h1></div>;
      case 'Settings':
        return <div className="p-8"><h1 className="text-2xl font-bold">Settings (Coming Soon)</h1></div>;
      default:
        return <Workspace projectPath={projectPath} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-dark overflow-hidden font-sans text-sm text-gray-300">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar projectName={projectName || (projectPath ? 'My Coffee Shop' : 'No Project')} />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
