import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0F0F0F',
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite default port
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers

// 1. Select Folder
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

async function linkDependencies(workspacePath) {
  // 1. Corrected path to target the actual node_modules folder inside internal_modules
  const masterModules = path.join(app.getAppPath(), 'internal_modules', 'node_modules');
  const targetModules = path.join(workspacePath, 'node_modules');

  try {
    // 2. Safely remove the existing broken link/folder if it exists
    if (fs.existsSync(targetModules)) {
      fs.removeSync(targetModules); 
    }
    
    // 3. Create the fresh symlink
    await fs.ensureSymlink(masterModules, targetModules);
    console.log('Symlink correctly mapped to internal_modules/node_modules');
  } catch (err) {
    console.error('Failed to link dependencies:', err);
  }
}

// 2. Clone Project to working directory
ipcMain.handle('clone-project', async (event, sourcePath) => {
  try {
    const workDir = path.join(app.getPath('userData'), 'siteforge_workspace');
    await fs.emptyDir(workDir);
    await fs.copy(sourcePath, workDir, {
      filter: (src) => !src.includes('node_modules') && !src.includes('.git')
    });
    
    const pkgPath = path.join(workDir, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      if (!pkg.scripts) pkg.scripts = {};
      if (!pkg.scripts.dev) {
        pkg.scripts.dev = "vite";
        pkg.scripts.build = "vite build";
        pkg.scripts.preview = "vite preview";
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }
    }

    await linkDependencies(workDir);

    // Check if package.json exists
    let projectType;
    if (fs.existsSync(pkgPath)) {
      projectType = 'vite-react';
    } else {
      projectType = 'vanilla';
    }

    const folderName = path.basename(sourcePath);
    
    return { success: true, workDir, path: workDir, name: folderName, type: projectType };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 3. Read JSON (Dynamic File Reading with Directory Traversal Protection)
ipcMain.handle('read-json', async (event, workDir, targetFile) => {
  try {
    if (!targetFile) throw new Error("targetFile is required");
    const targetPath = path.resolve(workDir, targetFile);

    // Security: Prevent directory traversal by ensuring the resolved path is inside workDir
    if (!targetPath.startsWith(path.resolve(workDir) + path.sep)) {
      return { success: false, error: 'Invalid path' };
    }

    if (await fs.pathExists(targetPath)) {
      const data = await fs.readJson(targetPath);
      return { success: true, data };
    }
    return { success: false, error: 'File not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 4. Write JSON (Dynamic File Writing with Directory Traversal Protection)
ipcMain.handle('write-json', async (event, workDir, targetFile, jsonData) => {
  try {
    if (!targetFile) throw new Error("targetFile is required");
    const targetPath = path.resolve(workDir, targetFile);

    // Security: Prevent directory traversal by ensuring the resolved path is inside workDir
    if (!targetPath.startsWith(path.resolve(workDir) + path.sep)) {
      return { success: false, error: 'Invalid path' };
    }

    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeJson(targetPath, jsonData, { spaces: 2 });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 5. Start Dev Server
let devProcess = null;

ipcMain.handle('start-dev', async (event, workDir) => {
  if (devProcess) {
    return { success: true, url: 'http://localhost:3002', message: 'Already running' };
  }

  return new Promise((resolve) => {
    devProcess = spawn('npm', ['run', 'dev', '--', '--port', '3002', '--strictPort'], {
      cwd: workDir,
      shell: true,
      env: { ...process.env, BROWSER: 'none' }
    });

    devProcess.on('error', (err) => {
      console.error('Failed to start dev process:', err);
      devProcess = null;
      resolve({ success: false, error: err.message });
    });

    devProcess.on('close', (code) => {
      console.log(`dev process closed with code ${code}`);
      devProcess = null;
    });

    setTimeout(() => {
      resolve({ success: true, url: 'http://localhost:3002' });
    }, 1500);
  });
});

ipcMain.handle('stop-dev', async () => {
  if (devProcess) {
    devProcess.kill();
    devProcess = null;
  }
  return { success: true };
});

// 6. Build and Export
ipcMain.handle('build-export', async (event, workDir) => {
  return new Promise(async (resolve) => {
    try {
      mainWindow.webContents.send('export-progress', 'Building (npm run build)...');
      
      const buildProc = spawn('npm', ['run', 'build'], { cwd: workDir, shell: true });
      
      buildProc.on('close', async (code) => {
        if (code !== 0) {
          resolve({ success: false, error: `Build failed with code ${code}` });
          return;
        }

        mainWindow.webContents.send('export-progress', 'Compressing dist folder...');
        const distPath = path.join(workDir, 'dist');
        if (!await fs.pathExists(distPath)) {
          resolve({ success: false, error: 'dist folder not found after build' });
          return;
        }

        const saveResult = await dialog.showSaveDialog(mainWindow, {
          title: 'Export Website',
          defaultPath: 'website-export.zip',
          filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
        });

        if (saveResult.canceled) {
          resolve({ success: false, error: 'Export canceled' });
          return;
        }

        const zipPath = saveResult.filePath;
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          resolve({ success: true, path: zipPath });
        });

        archive.on('error', (err) => {
          resolve({ success: false, error: err.message });
        });

        archive.pipe(output);
        archive.directory(distPath, false);
        archive.finalize();
      });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
});

// 7. List JSON Files
ipcMain.handle('list-json-files', async (event, workDir) => {
  try {
    const jsonFiles = [];

    // Recursive function to find JSON files
    async function findJsonFiles(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Skip node_modules, .git, dist, and hidden directories
          if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name) && !entry.name.startsWith('.')) {
            await findJsonFiles(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json')) {
            // Store relative path
            jsonFiles.push(path.relative(workDir, fullPath).replace(/\\/g, '/'));
          }
        }
      } catch (err) {
        // Silently skip unreadable directories
        console.warn(`Skipping unreadable directory: ${dir}`, err.message);
      }
    }

    if (workDir && await fs.pathExists(workDir)) {
      await findJsonFiles(workDir);
    }

    return { success: true, files: jsonFiles };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 8. List Components in src/components
ipcMain.handle('list-components', async (event, workDir) => {
  try {
    const componentsPath = path.join(workDir, 'src', 'components');
    if (await fs.pathExists(componentsPath)) {
      const items = await fs.readdir(componentsPath, { withFileTypes: true });
      // Return only directories or .jsx files as component names
      const components = items
        .filter(item => item.isDirectory() || item.name.endsWith('.jsx'))
        .map(item => item.name.replace('.jsx', ''));
      return { success: true, components };
    }
    return { success: true, components: [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
