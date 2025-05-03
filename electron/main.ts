import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Note } from '../interfaces/note-interfaces'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

const isDev = !!VITE_DEV_SERVER_URL
let windows: BrowserWindow[] = []
const store = new Store<{ notes: Record<string, Note> }>()
const notesState: Record<string, Note> = store.get('notes') || {}

const preload = path.join(__dirname, 'preload.mjs')

const saveNotes = () => {
	store.set('notes', notesState)
}

const createWindow = (note: Note) => {
	const win = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
		x: note.x ?? 100,
		y: note.y ?? 100,
		width: note.width ?? 300,
		height: note.height ?? 300,
		frame: false,
		webPreferences: {
			preload,
		},
	})

	if (isDev) {
		win.loadURL(`${VITE_DEV_SERVER_URL}?noteId=${note.id}`)
	} else {
		win.loadFile(path.join(__dirname, '../dist/index.html'), {
			search: `?noteId=${note.id}`,
		})
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

		// windows.push(win)
	})
}

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
	createWindow(newNote)
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
		winToClose.close() // triggers 'closed' event and removes from list
	}

	// notify other windows
	windows.forEach((win) => {
		if (!win.isDestroyed()) {
			win.webContents.send('note-deleted', noteId)
		}
	})
})

ipcMain.handle('get-app-version', () => {
	return app.getVersion()
})

app.whenReady().then(() => {
	if (Object.keys(notesState).length === 0) {
		const initialNote: Note = {
			id: 'rootNote',
			content: '',
		}
		notesState[initialNote.id] = initialNote
		saveNotes()
		createWindow(initialNote)
	} else {
		// reopens all saved windows
		Object.values(notesState).forEach((note) => createWindow(note))
	}

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			const fallbackNote = Object.values(notesState)[0]
			if (fallbackNote) createWindow(fallbackNote)
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.setAppUserModelId('br.tec.ulisses.notificatask')
