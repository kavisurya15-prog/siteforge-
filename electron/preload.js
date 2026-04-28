const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  cloneProject: (path) => ipcRenderer.invoke('clone-project', path),
  startDev: (workDir) => ipcRenderer.invoke('start-dev', workDir),
  stopDev: () => ipcRenderer.invoke('stop-dev'),
  buildExport: (workDir) => ipcRenderer.invoke('build-export', workDir),
  listComponents: (workDir) => ipcRenderer.invoke('list-components', workDir),
  onExportProgress: (callback) => ipcRenderer.on('export-progress', (_event, value) => callback(value)),
  invoke: (channel, ...args) => {
    const validChannels = [
      'select-folder', 'clone-project', 'start-dev', 'stop-dev',
      'build-export', 'list-components', 'read-json', 'write-json', 'list-json-files'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
  }
});
