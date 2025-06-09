"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  send: (channel, ...args) => {
    electron.ipcRenderer.send(channel, ...args);
  },
  receive: (channel, func) => {
    electron.ipcRenderer.on(channel, (_, ...args) => func(...args));
  },
  invoke: (channel, ...args) => {
    return electron.ipcRenderer.invoke(channel, ...args);
  },
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
    electron.contextBridge.exposeInMainWorld("electron", {
      ipcRenderer: {
        send: (channel, data) => {
          electron.ipcRenderer.send(channel, data);
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
