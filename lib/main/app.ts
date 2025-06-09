import { BrowserWindow, shell, app, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path, { join } from 'path'
import { registerWindowIPC } from '@/lib/window/ipcEvents'
import appIcon from '@/resources/build/favicon.ico?asset'
import { startRichPresence, stopRichPresence, updateRichPresence } from '../discord/richPresence'
import { loadClientId, resetClientId, saveClientId } from '../utils/configManager'
import { isDiscordRunning } from '../utils/processChecker'
import { loadAppConfig, saveAppConfig, toggleStartup, checkStartupEnabled } from '../utils/appConfig'

let tray: Tray | null = null;
let shouldQuit = false;

export function createAppWindow(): void {

  const mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    maxWidth: 800,
    maxHeight: 640,
    show: !loadAppConfig().startMinimized,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Lumina',
    maximizable: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  let isRichPresenceConnected = false;

  // Créer le tray icon
  if (!tray) {
    tray = new Tray(appIcon);

    // Menu contextuel pour le tray
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Ouvrir',
        click: () => {
          mainWindow.show();
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

    // Double-click sur le tray pour montrer la fenêtre
    tray.on('double-click', () => {
      mainWindow.show();
    });
  }

  // Quand on ferme la fenêtre, on la minimise dans le tray au lieu de la fermer
  mainWindow.on('close', (event) => {
    if (!shouldQuit) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });

  // Register IPC events for the main window.
  registerWindowIPC(mainWindow)

  // Configuration handlers
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
    startRichPresence(clientId, profile); // tu passes bien le profil ici
    isRichPresenceConnected = true;
  });

  ipcMain.on('update-rich', (_, data) => {
    updateRichPresence(data);
    console.log(data)
  });
  ipcMain.handle('load-client-id', () => {
    return loadClientId();
  });
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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
  });
  ipcMain.handle('rich-status', async () => {
    const isDiscordOpen = await isDiscordRunning();
    return {
      isConnected: isRichPresenceConnected,
      isDiscordOpen
    };
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
