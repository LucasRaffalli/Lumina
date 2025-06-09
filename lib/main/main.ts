import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createAppWindow } from './app'

// Variable pour contrôler la fermeture de l'application
let shouldQuit = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Create app window
  createAppWindow()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createAppWindow()
    }
  })
})

// Cette fois-ci, on veut garder l'application en vie même quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide()
  }
  // On ne quitte pas l'application, elle continue de tourner en tâche de fond
})

// Gestion propre de la fermeture de l'application
app.on('before-quit', () => {
  shouldQuit = true;
})

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
