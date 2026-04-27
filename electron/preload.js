const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  cloneProject: (path) => ipcRenderer.invoke('clone-project', path),
  readConfig: (workDir) => ipcRenderer.invoke('read-config', workDir),
  saveConfig: (workDir, data) => ipcRenderer.invoke('save-config', workDir, data),
  startDev: (workDir) => ipcRenderer.invoke('start-dev', workDir),
  stopDev: () => ipcRenderer.invoke('stop-dev'),
  buildExport: (workDir) => ipcRenderer.invoke('build-export', workDir),
  listComponents: (workDir) => ipcRenderer.invoke('list-components', workDir),
  onExportProgress: (callback) => ipcRenderer.on('export-progress', (_event, value) => callback(value)),
});
