import EventEmitter from 'node:events'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { app, BrowserWindow, ipcMain, Notification, Tray } from 'electron'

import { Note } from '../interfaces/note-interface'
import { NoteNotification } from 'interfaces/note-notification-interface'
import schedule from 'node-schedule'
import store from './store'
import { AlarmSoundKeyType } from '@/libs/app-notification'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

const isDev = !!VITE_DEV_SERVER_URL
let windows: BrowserWindow[] = []
let mainWindow: BrowserWindow
let aboutWindow: BrowserWindow
let notesState: Record<string, Note> = store.get('notes') || {}
let notesNotificationState: Record<string, NoteNotification> = store.get('notesNotification') || {}
let activeNotesId: string[] = []

const eventEmitter = new EventEmitter()

const preload = path.join(__dirname, 'preload.mjs')

const saveNotes = () => {
	store.set('notes', notesState)
}

const saveNotesNotification = () => {
	store.set('notesNotification', notesNotificationState)
}

const createMainWindow = () => {
	const tray = new Tray(path.join(process.env.VITE_PUBLIC, 'icon.png'))
	const trayBounds = tray.getBounds()

	mainWindow = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
		width: 225,
		height: 520,
		y: trayBounds.y + -520,
		x: trayBounds.x,
		resizable: false,
		alwaysOnTop: true,
		movable: false,
		show: false,
		skipTaskbar: true,
		frame: false,
		webPreferences: {
			preload,
		},
	})

	if (isDev) {
		mainWindow.loadURL(VITE_DEV_SERVER_URL as string)
	} else {
		mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
	}

	tray.on('click', () => {
		mainWindow.show()
	})

	ipcMain.handle('hide-main-window', () => {
		mainWindow.hide()
	})

	mainWindow.on('closed', () => {
		eventEmitter.removeAllListeners('windows-close')
		app.quit()
	})

	// pooling for notifications, executing every 3 seconds
	schedule.scheduleJob('*/10 * * * * *', () => {
		if (!mainWindow.isDestroyed()) {
			mainWindow.webContents.send('check-notification-schedule', notesNotificationState)
		}
	})
}

const createAboutWindow = () => {
	aboutWindow = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
		width: 360,
		height: 280,
		alwaysOnTop: true,
		frame: false,
		resizable: false,
		maximizable: false,
		minimizable: false,
		webPreferences: {
			preload,
		},
	})

	if (isDev) {
		aboutWindow.loadURL(`${VITE_DEV_SERVER_URL}#about`)
	} else {
		const indexPath = path.join(__dirname, '../dist/index.html')
		aboutWindow.loadURL(`file://${indexPath}#about`)
	}
}

const createNoteWindow = (note: Note) => {
	const win = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
		x: note.x ?? 100,
		y: note.y ?? 100,
		width: note.width ?? 300,
		height: note.height ?? 300,
		frame: false,
		webPreferences: {
			preload,
		},
	})

	activeNotesId.push(note.id)

	if (isDev) {
		win.loadURL(`${VITE_DEV_SERVER_URL}#note?noteId=${note.id}`)
	} else {
		// win.loadFile(path.join(__dirname, '../dist/index.html'))
		const indexPath = path.join(__dirname, '../dist/index.html')
		win.loadURL(`file://${indexPath}#note?noteId=${note.id}`)
	}

	windows.push(win)

	win.on('moved', () => {
		const bounds = win.getBounds()
		const current = notesState[note.id]
		if (current) {
			current.x = bounds.x
			current.y = bounds.y
			saveNotes()
		}
	})

	win.on('resized', () => {
		const bounds = win.getBounds()
		const current = notesState[note.id]
		if (current) {
			current.width = bounds.width
			current.height = bounds.height
			saveNotes()
		}
	})

	win.on('closed', () => {
		windows = windows.filter((w) => w !== win)
		activeNotesId = activeNotesId.filter((noteId) => noteId !== note.id)
		eventEmitter.emit('windows-close')
	})
}

ipcMain.handle('get-notification-schedule', (_, noteId): NoteNotification | undefined => {
	return notesNotificationState?.[noteId] || {}
})

ipcMain.handle('get-initial-state', (_, noteId): Note | undefined => {
	return notesState[noteId]
})

// IPC: update note
ipcMain.on('update-note', (_, updatedNote: Note) => {
	notesState[updatedNote.id] = updatedNote
	saveNotes()

	// broadcast to all windows
	windows.forEach((win) => {
		win.webContents.send('note-updated', updatedNote)
	})
})

// IPC: create a new note
ipcMain.on('create-new-note', () => {
	const newNote: Note = {
		id: Date.now().toString(),
		content: '',
		y: 100,
		x: 100,
	}

	notesState[newNote.id] = newNote
	saveNotes()
	createNoteWindow(newNote)
})

// IPC: remove note
ipcMain.on('delete-note', (_, noteId: string) => {
	// romove from state
	delete notesState[noteId]
	saveNotes()

	// close the current window
	const winToClose = windows.find((win) => {
		const url = win.webContents.getURL()
		return url.includes(`noteId=${noteId}`)
	})

	if (winToClose && !winToClose.isDestroyed()) {
		activeNotesId = activeNotesId.filter((ItemNoteId) => ItemNoteId !== noteId)
		winToClose.close() // triggers 'closed' event and removes from list
		eventEmitter.emit('windows-close')
	}

	// notify other windows
	windows.forEach((win) => {
		if (!win.isDestroyed()) {
			win.webContents.send('note-deleted', noteId)
		}
	})
})

ipcMain.on('set-note-notification', (_, notification: NoteNotification) => {
	notesNotificationState[notification.noteId] = notification
	saveNotesNotification()

	windows.forEach((win) => {
		if (!win.isDestroyed()) {
			win.webContents.send('note-notification-updated', notification)
		}
	})
})

ipcMain.on('delete-note-notification', (_, noteId: string) => {
	delete notesNotificationState[noteId]
	saveNotesNotification()

	windows.forEach((win) => {
		if (!win.isDestroyed()) {
			win.webContents.send('note-notification-deleted', noteId)
		}
	})
})

ipcMain.handle('get-note-notification', (_, noteId: string) => {
	return notesNotificationState[noteId]
})

ipcMain.handle('get-app-version', () => {
	return app.getVersion()
})

ipcMain.handle('close-all-notes', () => {
	windows.forEach((win) => {
		win.close()
	})

	activeNotesId = []
	eventEmitter.emit('windows-close')

	return
})

ipcMain.handle('delete-all-notes', () => {
	store.set('notesNotification', {})
	store.set('notes', {})
	notesState = {}
	notesNotificationState = {}
	activeNotesId = []

	windows.forEach((win) => {
		win.close()
	})
})

ipcMain.handle('open-all-notes', () => {
	if (Object.keys(notesState).length >= 0) {
		Object.values(notesState)
			.filter((note) => !activeNotesId.includes(note.id))
			.forEach((note) => createNoteWindow(note))
	}

	if (Object.keys(notesState).length === 0) {
		new Notification({
			title: 'alert',
			body: "You don't have any note to open!",
		}).show()
	}

	return
})

ipcMain.handle('open-about-window', createAboutWindow)

ipcMain.handle('close-about-window', () => {
	aboutWindow.close()
})

ipcMain.handle('close-app', () => {
	eventEmitter.removeAllListeners('windows-close')
	app.quit()
})

ipcMain.on('change-notification-sound', (_, sound: AlarmSoundKeyType) => {
	store.set('notificationSound', sound)
})

ipcMain.handle('get-notification-sound', () => {
	return store.get('notificationSound')
})

ipcMain.handle('get-about-info', () => {
	return {
		appName: app.getName(),
		appVersion: app.getVersion(),
		nodeVersion: process.versions.node,
		chromeVersion: process.versions.chrome,
		electronVersion: process.versions.electron,
		platform: process.platform,
		arch: process.arch,
	}
})

const enableAutoLaunch = () => {
	app.setLoginItemSettings({
		openAtLogin: true,
		path: app.getPath('exe'),
	})
}

const disableAutoLaunch = () => {
	app.setLoginItemSettings({
		openAtLogin: false,
		path: app.getPath('exe'),
	})
}

const isAutoLaunchEnabled = () => {
	const settings = app.getLoginItemSettings()
	return settings.openAtLogin
}

ipcMain.handle('get-auto-launch', () => {
	return isAutoLaunchEnabled()
})

ipcMain.handle('set-auto-launch', (_, enable) => {
	if (enable) {
		enableAutoLaunch()
	} else {
		disableAutoLaunch()
	}
})

app.whenReady().then(async () => {
	createMainWindow()

	if (Object.keys(notesState).length === 0) {
		mainWindow.show()

		const initialNote: Note = {
			id: 'rootNote',
			content: '',
		}

		notesState[initialNote.id] = initialNote
		saveNotes()
		createNoteWindow(initialNote)
	}

	if (Object.keys(notesState).length > 0) {
		Object.values(notesState)
			.filter((note) => !activeNotesId.includes(note.id))
			.forEach((note) => createNoteWindow(note))
	}

	eventEmitter.on('windows-close', () => {
		if (windows.length === 0 && !mainWindow.isVisible()) {
			eventEmitter.removeAllListeners('windows-close')
			app.quit()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		eventEmitter.removeAllListeners('windows-close')
		app.quit()
	}
})

app.setAppUserModelId('br.tec.ulisses.notificatask')
