import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIpcHandlers } from './ipc/handlers'
import { TelemetrySampler } from './services/sampler/TelemetrySampler'
import { DatabaseService } from './services/database/DatabaseService'

let mainWindow: BrowserWindow | null = null
let telemetrySampler: TelemetrySampler | null = null
let databaseService: DatabaseService | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Open DevTools automatically in development mode
    if (is.dev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  mainWindow.webContents.on('did-finish-load', async () => {
    // Start sampling when the renderer is ready
    await telemetrySampler?.start()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Temporarily disable CSP for debugging
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': [
  //         "default-src 'self';",
  //         "script-src 'self' 'unsafe-inline';",
  //         "style-src 'self' 'unsafe-inline';",
  //         "img-src 'self' data:;",
  //         "font-src 'self';",
  //         "connect-src 'self';"
  //       ].join(' ')
  //     }
  //   })
  // })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // In production, files are packaged relative to the main process location
    const rendererPath = join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(rendererPath)
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron.resourcemonitor')

  // Install DevTools extensions in development mode (after window creation for better performance)
  if (is.dev) {
    // Load extensions after a short delay to not block window creation
    setTimeout(async () => {
      try {
        const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = await import('electron-devtools-installer')
        await installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
          loadExtensionOptions: { allowFileAccess: true },
          forceDownload: false
        })
        console.log('DevTools extensions installed successfully')
      } catch (error) {
        console.error('Failed to install DevTools extensions:', error)
      }
    }, 2000) // 2 second delay
  }

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  databaseService = new DatabaseService()
  databaseService.initialize()

  telemetrySampler = new TelemetrySampler()
  setupIpcHandlers(ipcMain, telemetrySampler, databaseService)

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  telemetrySampler?.stop()
  databaseService?.close()
  // Always quit the app when all windows are closed, even on macOS
  app.quit()
})

app.on('before-quit', () => {
  telemetrySampler?.stop()
  databaseService?.close()
})
