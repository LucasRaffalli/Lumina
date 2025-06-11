import { app, BrowserWindow, ipcMain, Menu, nativeImage, shell, Tray } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import { registerWindowIPC } from '../win/ipcEvents'
import { checkStartupEnabled, loadAppConfig, saveAppConfig, toggleStartup } from '../utils/appConfig'
import { loadClientId, resetClientId, saveClientId } from '../utils/configManager'
import { startRichPresence, stopRichPresence, updateRichPresence } from '../discord/richPresence'
import { isDiscordRunning } from '../utils/processChecker'
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))


// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')
console.log('Loading file:', indexHtml)
async function createWindow() {
  const iconConnected = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'favicon.ico'));
  iconConnected.setTemplateImage(true);
  const iconDisconnected = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'favicon-disconnected.ico'));
  iconDisconnected.setTemplateImage(true);

  const resizedIconConnected = iconConnected.resize({
    width: 256,
    height: 256,
    quality: 'better'
  });
  const resizedIconDisconnected = iconDisconnected.resize({
    width: 256,
    height: 256,
    quality: 'better'
  });

  let isRichPresenceConnected = false;
  let tray: Tray | null = null;
  let shouldQuit = false;
  let isWindowLarge = false;
  let isProgrammaticResize = false;

  function updateTray() {
    if (!tray) return;
    tray.setImage(isRichPresenceConnected ? resizedIconConnected : resizedIconDisconnected);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Ouvrir',
        click: () => {
          win?.show();
        }
      },
      {
        label: 'Quitter',
        click: () => {
          shouldQuit = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Lumina');
  }

  win = new BrowserWindow({
    title: 'Lumina',
    backgroundColor: '#1c1c1c',
    frame: false,
    titleBarStyle: 'hiddenInset',
    maximizable: false,
    resizable: true,
    show: !loadAppConfig().startMinimized,
    width: 600,
    height: 500,
    icon: resizedIconConnected,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: true
    },
  })
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {

    win.loadFile(indexHtml)
  }

  if (!tray) {
    tray = new Tray(resizedIconDisconnected);
    updateTray();
    tray.on('double-click', () => {
      win?.show();
    });
  }

  // Handler IPC pour alterner la taille de la fenêtre principale
  ipcMain.handle('resize-main-window', (_, shouldEnlarge: boolean) => {
    if (!win) return;
    if (shouldEnlarge) {
      win.setResizable(true);
      win.setSize(900, 500);
      win.center();
      win.setResizable(false);
      isWindowLarge = true;
    } else {
      win.setResizable(true);
      win.setSize(600, 500);
      win.center();
      win.setResizable(false);
      isWindowLarge = false;
    }
  });

  // Empêche le resize à la souris
  win.on('will-resize', (event) => {
    if (!isProgrammaticResize) {
      event.preventDefault();
    }
  });

  // Quand on ferme la fenêtre, on la minimise dans le tray au lieu de la fermer
  win.on('close', (event) => {
    if (!shouldQuit) {
      event.preventDefault();
      win?.hide();
      return false;
    }
    return true;
  });

  // Configuration handlers discord rich presence
  ipcMain.handle('get-app-config', () => {
    return loadAppConfig();
  });

  ipcMain.handle('save-app-config', (_, config) => {
    const savedConfig = saveAppConfig(config);
    if ('runOnStartup' in config) {
      toggleStartup(config.runOnStartup);
    }
    return savedConfig;
  });

  ipcMain.handle('check-startup-enabled', () => {
    return checkStartupEnabled();
  });

  ipcMain.on('start-rich', (_, data) => {
    const { clientId, profile } = data;
    saveClientId(clientId);
    startRichPresence(clientId, profile);
    isRichPresenceConnected = true;
    updateTray();
  });

  ipcMain.on('update-rich', (_, data) => {
    updateRichPresence(data);
  });
  ipcMain.handle('load-client-id', () => {
    return loadClientId();
  });
  win.on('ready-to-show', () => {
    win?.show()
  })
  ipcMain.handle('reset-client-id', () => {
    resetClientId();
  });
  ipcMain.handle('open-config-folder', () => {
    const configDir = app.getPath('userData');
    shell.openPath(configDir);
  });
  ipcMain.handle('disconnect-rich', () => {
    stopRichPresence();
    isRichPresenceConnected = false;
    updateTray();
  });
  ipcMain.handle('rich-status', async () => {
    const isDiscordOpen = await isDiscordRunning();
    return {
      isConnected: isRichPresenceConnected,
      isDiscordOpen
    };
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Erreur de chargement:', errorCode, errorDescription);
  });


  registerWindowIPC(win)

  console.log("Initializing auto-updater...")
  update(win)
}

app.whenReady().then(async () => {
  await createWindow()

});

app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--new-window',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'Nouvelle fenêtre',
    description: 'Créer une nouvelle fenêtre'
  }
])
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
