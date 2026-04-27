# SiteForge Project Status Report

## 1. Complete Folder & File Structure
```text
/siteforge
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── dist/                # Production build output
├── electron/
│   ├── main.js          # Main process script
│   └── preload.js       # Context bridge & IPC exposures
├── internal_modules/    # Contains pre-installed node_modules for cloning
├── node_modules/        # Project dependencies
├── public/              # Static assets
└── src/
    ├── index.css        # Global CSS / Tailwind directives
    └── components/
        ├── ComponentManager.jsx
        ├── ContentEditor.jsx
        ├── Dashboard.jsx
        ├── DesignEditor.jsx
        ├── ExportManager.jsx
        ├── Navbar.jsx
        ├── PreviewManager.jsx
        ├── Sidebar.jsx
        └── Workspace.jsx
```

## 2. Core Dependencies (`package.json`)
The project utilizes an Electron + Vite + React stack. 
**Key Dependencies:**
- `electron` (v41.2.2) - Desktop framework
- `react` & `react-dom` (v18.3.1) - Frontend framework
- `vite` (v5.4.10) - Dev server and bundler
- `tailwindcss` (v3.4.19) - Utility-first CSS framework
- `lucide-react` (v1.8.0) - SVG icon library
- `archiver` (v7.0.1) - Used in `main.js` for zipping the final exported site
- `fs-extra` (v11.3.4) - Used in `main.js` for robust local file system operations

## 3. React Components Breakdown

| Component | Props | State | Description |
| :--- | :--- | :--- | :--- |
| **`Dashboard`** | `setProjectPath`, `setProjectName`, `setProjectType`, `setCurrentView` | `loading`, `error` | The initial landing screen. Handles user folder selection and invokes the IPC to clone the selected Vite project into the workspace. |
| **`Workspace`** | `projectPath`, `setProjectPath`, `setProjectName`, `setProjectType` | `activeStep`, `device`, `loading`, `devServerRunning` | The core layout engine containing the step rail, the side panels (Design/Content/Export), and the central `iframe` canvas where the live dev server is embedded. |
| **`Sidebar`** | `currentView`, `setCurrentView` | *(none)* | Global left-hand navigation menu to toggle between Dashboard, Workspace, Settings, etc. |
| **`Navbar`** | `projectName` | *(none)* | Global top-bar showing the current project name and user profile. |
| **`ComponentManager`**| `projectPath`, `selectedComponent`, `onSelect` | `components`, `loading` | Lists files inside `src/components` of the imported project using the IPC `list-components` handler. |
| **`DesignEditor`** | `projectPath` | `activeTab`, `selectedComponent`, `config` | Allows editing visual properties (background, colors, padding). Reads values from `src/data/config.json`. |
| **`ContentEditor`** | *(passed `projectPath` but not consumed in current file)* | *(none)* | **Currently completely hardcoded mock UI.** Provides fields for Shop Info and Product Lists. |
| **`PreviewManager`**| `projectPath` | `status` | Contains logic and UI to manually trigger the dev server and view status. |
| **`ExportManager`** | `projectPath` | `loading`, `progress`, `error`, `success` | Listens to IPC streams for build progress and allows users to export the final `dist` folder as a ZIP file. |

## 4. Electron Backend State

### `main.js` & `preload.js`
The Electron backend is fully configured with `contextIsolation` enabled. `preload.js` exposes `window.electronAPI` to the renderer. 

**Registered IPC Channels:**
- `invoke('select-folder')`: Opens the native OS directory picker.
- `invoke('clone-project', path)`: Copies the selected project folder to a safe `siteforge_workspace` inside `userData`, ignoring existing `.git` and `node_modules`. It then symlinks `internal_modules/node_modules` to speed up project initialization.
- `invoke('read-config', workDir)`: Reads `src/data/config.json` from the imported project.
- `invoke('save-config', workDir, data)`: Writes back to `src/data/config.json`.
- `invoke('start-dev', workDir)`: Spawns `npm run dev` as a child process.
- `invoke('stop-dev')`: Kills the existing dev server process.
- `invoke('build-export', workDir)`: Spawns `npm run build`, archives the resulting `dist/` directory, and prompts the user to save a `.zip` file.
- `invoke('list-components', workDir)`: Reads the directory tree of `src/components/` inside the workspace.
- `on('export-progress')`: Stream progress strings to the frontend during the build process.

## 5. Functional Analysis

### 🟢 What is Working (Visually & Functionally)
- **High-Fidelity UI:** The "black and gold" aesthetic and layout architectures look fantastic. Animations, active states, and custom scrollbars are implemented successfully.
- **Project Importing Pipeline:** Selecting a folder, copying it to a safe workspace, and mapping dependency symlinks works correctly.
- **Live Dev Preview:** The Workspace canvas correctly spins up the dev server upon project load and embeds an `iframe` pointing to `http://localhost:5173`.
- **Exporting Flow:** The build and ZIP process accurately compiles the Vite app and offers a local save dialog, complete with progress updates on the frontend.
- **Component Discovery:** `list-components` successfully detects and displays components in the sidebar.

### 🔴 What is Broken or Missing
- **Content Editor is a Mock:** `ContentEditor.jsx` contains hardcoded HTML mockups. It is not tied to any backend JSON or data files. Making edits here does absolutely nothing.
- **Design Editor "Save" functionality:** While `DesignEditor.jsx` can successfully load a `config.json`, the "Save Design Changes" button does not have an `onClick` handler. Modifications made in the state are never sent over the `save-config` IPC channel.
- **Hardcoded Port 5173:** The Workspace iframe points strictly to `http://localhost:5173`. If a port conflict occurs and Vite starts on `5174`, the embedded preview will show a blank screen.
- **Naive Component Parsing:** The system assumes anything in `src/components` is an editable design piece. This could break if there are utility files or non-React modules inside the folder.
