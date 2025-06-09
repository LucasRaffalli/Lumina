"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const path = require("path");
const os = require("os");
const RPC = require("discord-rpc");
const crypto = require("crypto");
const child_process = require("child_process");
const fs = require("fs");
const handleIPC = (channel, handler) => {
  electron.ipcMain.handle(channel, handler);
};
const registerWindowIPC = (mainWindow) => {
  mainWindow.setMenuBarVisibility(false);
  handleIPC("init-window", () => {
    const { width, height } = mainWindow.getBounds();
    const minimizable = mainWindow.isMinimizable();
    const maximizable = mainWindow.isMaximizable();
    const platform = os.platform();
    return { width, height, minimizable, maximizable, platform };
  });
  handleIPC("is-window-minimizable", () => mainWindow.isMinimizable());
  handleIPC("is-window-maximizable", () => mainWindow.isMaximizable());
  handleIPC("window-minimize", () => mainWindow.minimize());
  handleIPC("window-maximize", () => mainWindow.maximize());
  handleIPC("window-close", () => mainWindow.close());
  handleIPC("window-maximize-toggle", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  const webContents = mainWindow.webContents;
  handleIPC("web-undo", () => webContents.undo());
  handleIPC("web-redo", () => webContents.redo());
  handleIPC("web-cut", () => webContents.cut());
  handleIPC("web-copy", () => webContents.copy());
  handleIPC("web-paste", () => webContents.paste());
  handleIPC("web-delete", () => webContents.delete());
  handleIPC("web-select-all", () => webContents.selectAll());
  handleIPC("web-reload", () => webContents.reload());
  handleIPC("web-force-reload", () => webContents.reloadIgnoringCache());
  handleIPC("web-toggle-devtools", () => webContents.toggleDevTools());
  handleIPC("web-actual-size", () => webContents.setZoomLevel(0));
  handleIPC("web-zoom-in", () => webContents.setZoomLevel(webContents.zoomLevel + 0.5));
  handleIPC("web-zoom-out", () => webContents.setZoomLevel(webContents.zoomLevel - 0.5));
  handleIPC("web-toggle-fullscreen", () => mainWindow.setFullScreen(!mainWindow.fullScreen));
  handleIPC("web-open-url", (_e, url) => electron.shell.openExternal(url));
};
const appIcon = path.join(__dirname, "../../resources/build/favicon.ico");
function isDiscordRunning() {
  return new Promise((resolve) => {
    const platform = process.platform;
    let command = "";
    switch (platform) {
      case "win32":
        command = 'tasklist /FI "IMAGENAME eq Discord.exe"';
        break;
      case "darwin":
        command = "pgrep -x Discord";
        break;
      case "linux":
        command = "pgrep -x Discord";
        break;
      default:
        resolve(false);
        return;
    }
    child_process.exec(command, (error, stdout) => {
      if (error) {
        resolve(false);
        return;
      }
      if (platform === "win32") {
        resolve(stdout.toLowerCase().includes("discord.exe"));
      } else {
        resolve(stdout.trim().length > 0);
      }
    });
  });
}
let rpc = null;
let connected = false;
let currentClientId = "";
let currentActivity = {};
let currentPartyId = "";
let retryTimeout = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5e3;
const CONNECTION_TIMEOUT = 1e4;
async function cleanup(force = false) {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  if (rpc) {
    try {
      if (!force) {
        await rpc.clearActivity();
      }
      await rpc.destroy();
    } catch (e) {
      console.warn("⚠️ Erreur lors du nettoyage:", e);
    }
    rpc = null;
  }
  if (force) {
    connected = false;
    currentActivity = {};
    currentPartyId = "";
    currentClientId = "";
    connectionAttempts = 0;
  }
}
async function attemptConnection(clientId, profile) {
  try {
    const isRunning = await isDiscordRunning();
    if (!isRunning) {
      throw new Error("DISCORD_NOT_RUNNING");
    }
    await cleanup();
    connectionAttempts++;
    console.log(`⌛ Tentative de connexion ${connectionAttempts}/${MAX_RETRIES}...`);
    await RPC.register(clientId);
    rpc = new RPC.Client({ transport: "ipc" });
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        if (connectionAttempts < MAX_RETRIES) {
          console.log(`⌛ Timeout de connexion, tentative ${connectionAttempts + 1}/${MAX_RETRIES}...`);
          await cleanup();
          try {
            const result = await attemptConnection(clientId, profile);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          await cleanup(true);
          reject(new Error("CONNECTION_TIMEOUT_MAX_RETRIES"));
        }
      }, CONNECTION_TIMEOUT);
      rpc.once("ready", async () => {
        clearTimeout(timeoutId);
        connected = true;
        connectionAttempts = 0;
        console.log("✅ RPC connecté avec ID:", clientId);
        const initialActivity = {
          instance: false,
          partyId: currentPartyId,
          buttons: [
            { label: "Site web", url: "https://lumina.app" },
            { label: "Documentation", url: "https://www.youtube.com/" }
          ]
        };
        if (profile) {
          const updates = {
            details: profile.details?.trim(),
            state: profile.state?.trim(),
            largeImageKey: profile.largeImage || profile.largeImageKey,
            largeImageText: profile.largeText || profile.largeImageText,
            smallImageKey: profile.smallImage || profile.smallImageKey,
            smallImageText: profile.smallText || profile.smallImageText,
            startTimestamp: profile.startTimestamp || (profile.timestamp ? new Date(profile.timestamp).getTime() : void 0),
            partySize: profile.partySize ? Number(profile.partySize) : void 0,
            partyMax: profile.partyMax ? Number(profile.partyMax) : void 0
          };
          Object.entries(updates).forEach(([key, value]) => {
            if (value !== void 0 && value !== null && value !== "") {
              initialActivity[key] = value;
            }
          });
        }
        currentActivity = { ...initialActivity };
        try {
          await rpc?.setActivity(initialActivity);
          resolve(true);
        } catch (error) {
          console.error("❌ Erreur lors de la définition de l'activité initiale:", error);
          reject(error);
        }
      });
      rpc.on("disconnected", async () => {
        console.log("⚠️ RPC déconnecté");
        connected = false;
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        retryTimeout = setTimeout(async () => {
          if (!connected && connectionAttempts < MAX_RETRIES) {
            try {
              await attemptConnection(clientId, profile);
            } catch (error) {
              console.error("❌ Échec de la reconnexion automatique:", error);
              await cleanup(true);
            }
          }
        }, RETRY_DELAY);
      });
      rpc.login({ clientId }).catch(async (error) => {
        clearTimeout(timeoutId);
        await cleanup();
        reject(error);
      });
    });
  } catch (error) {
    console.error(`❌ Tentative de connexion ${connectionAttempts} échouée:`, error);
    if (error?.message === "DISCORD_NOT_RUNNING") {
      console.log("⚠️ Discord n'est pas en cours d'exécution");
      await cleanup(true);
      return;
    }
    if (connectionAttempts < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return attemptConnection(clientId, profile);
    }
    await cleanup(true);
    throw error;
  }
}
async function startRichPresence(clientId, profile) {
  try {
    if (connected && clientId === currentClientId && rpc) {
      await stopRichPresence();
    }
    connected = false;
    currentClientId = clientId;
    currentActivity = {};
    currentPartyId = crypto.randomUUID();
    await attemptConnection(clientId, profile);
  } catch (error) {
    console.error("❌ Erreur globale dans startRichPresence:", error);
    await stopRichPresence();
    throw error;
  }
}
async function stopRichPresence() {
  try {
    await cleanup();
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt du RPC:", error);
  }
}
function updateRichPresence(data) {
  if (!rpc || !connected) {
    console.warn("⚠️ Impossible de mettre à jour: RPC non connecté");
    return;
  }
  try {
    const updatedActivity = { ...currentActivity };
    if (data.details) {
      const trimmedDetails = data.details.trim();
      if (trimmedDetails) updatedActivity.details = trimmedDetails;
    }
    if (data.state) {
      const trimmedState = data.state.trim();
      if (trimmedState) updatedActivity.state = trimmedState;
    }
    if (data.largeImageKey) updatedActivity.largeImageKey = data.largeImageKey;
    if (data.largeImageText) {
      const trimmedText = data.largeImageText.trim();
      if (trimmedText) updatedActivity.largeImageText = trimmedText;
    }
    if (data.smallImageKey) updatedActivity.smallImageKey = data.smallImageKey;
    if (data.smallImageText) {
      const trimmedText = data.smallImageText.trim();
      if (trimmedText) updatedActivity.smallImageText = trimmedText;
    }
    if (typeof data.partyMax === "number") updatedActivity.partyMax = data.partyMax;
    if (typeof data.partySize === "number") updatedActivity.partySize = data.partySize;
    if (data.startTimestamp) updatedActivity.startTimestamp = data.startTimestamp;
    currentActivity = { ...updatedActivity };
    rpc.setActivity(updatedActivity);
    console.log("✅ RPC mis à jour avec:", updatedActivity);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du RPC:", error);
  }
}
const configPath$1 = path.join(electron.app.getPath("userData"), "luminaConfig.json");
function saveClientId(clientId) {
  fs.writeFileSync(configPath$1, JSON.stringify({ clientId }, null, 2));
}
function loadClientId() {
  if (!fs.existsSync(configPath$1)) return null;
  try {
    const raw = fs.readFileSync(configPath$1, "utf-8");
    const data = JSON.parse(raw);
    return data.clientId || null;
  } catch {
    return null;
  }
}
function resetClientId() {
  if (fs.existsSync(configPath$1)) {
    fs.unlinkSync(configPath$1);
  }
}
const configPath = path.join(electron.app.getPath("userData"), "appConfig.json");
const defaultConfig = {
  autoConnect: false,
  startMinimized: false,
  themeMode: "dark",
  runOnStartup: false
};
function loadAppConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}
function saveAppConfig(config) {
  const newConfig = { ...defaultConfig, ...config };
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  return newConfig;
}
function toggleStartup(enable) {
  if (process.platform === "win32") {
    const appPath = electron.app.getPath("exe");
    path.join(electron.app.getPath("appData"), "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "Lumina.lnk");
    if (enable) {
      electron.app.setLoginItemSettings({
        openAtLogin: true,
        path: appPath
      });
    } else {
      electron.app.setLoginItemSettings({
        openAtLogin: false
      });
    }
  }
}
function checkStartupEnabled() {
  if (process.platform === "win32") {
    const settings = electron.app.getLoginItemSettings();
    return settings.openAtLogin;
  }
  return false;
}
let tray = null;
let shouldQuit = false;
function createAppWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 600,
    height: 500,
    maxWidth: 800,
    maxHeight: 640,
    show: !loadAppConfig().startMinimized,
    backgroundColor: "#1c1c1c",
    icon: appIcon,
    frame: false,
    titleBarStyle: "hiddenInset",
    title: "Lumina",
    maximizable: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      sandbox: false
    }
  });
  let isRichPresenceConnected = false;
  if (!tray) {
    tray = new electron.Tray(appIcon);
    const contextMenu = electron.Menu.buildFromTemplate([
      {
        label: "Ouvrir",
        click: () => {
          mainWindow.show();
        }
      },
      {
        label: "Quitter",
        click: () => {
          shouldQuit = true;
          electron.app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip("Lumina");
    tray.on("double-click", () => {
      mainWindow.show();
    });
  }
  mainWindow.on("close", (event) => {
    if (!shouldQuit) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });
  registerWindowIPC(mainWindow);
  electron.ipcMain.handle("get-app-config", () => {
    return loadAppConfig();
  });
  electron.ipcMain.handle("save-app-config", (_, config) => {
    const savedConfig = saveAppConfig(config);
    if ("runOnStartup" in config) {
      toggleStartup(config.runOnStartup);
    }
    return savedConfig;
  });
  electron.ipcMain.handle("check-startup-enabled", () => {
    return checkStartupEnabled();
  });
  electron.ipcMain.on("start-rich", (_, data) => {
    const { clientId, profile } = data;
    saveClientId(clientId);
    startRichPresence(clientId, profile);
    isRichPresenceConnected = true;
  });
  electron.ipcMain.on("update-rich", (_, data) => {
    updateRichPresence(data);
    console.log(data);
  });
  electron.ipcMain.handle("load-client-id", () => {
    return loadClientId();
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  electron.ipcMain.handle("reset-client-id", () => {
    resetClientId();
  });
  electron.ipcMain.handle("open-config-folder", () => {
    const configDir = electron.app.getPath("userData");
    electron.shell.openPath(configDir);
  });
  electron.ipcMain.handle("disconnect-rich", () => {
    stopRichPresence();
    isRichPresenceConnected = false;
  });
  electron.ipcMain.handle("rich-status", async () => {
    const isDiscordOpen = await isDiscordRunning();
    return {
      isConnected: isRichPresenceConnected,
      isDiscordOpen
    };
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (!electron.app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  createAppWindow();
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createAppWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform === "darwin" && electron.app.dock) {
    electron.app.dock.hide();
  }
});
electron.app.on("before-quit", () => {
});
