import { ipcRenderer, contextBridge } from 'electron'
import { Note } from '../interfaces/note-interfaces'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
	on(...args: Parameters<typeof ipcRenderer.on>) {
		const [channel, listener] = args
		return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
	},
	off(...args: Parameters<typeof ipcRenderer.off>) {
		const [channel, ...omit] = args
		return ipcRenderer.off(channel, ...omit)
	},
	send(...args: Parameters<typeof ipcRenderer.send>) {
		const [channel, ...omit] = args
		return ipcRenderer.send(channel, ...omit)
	},
	invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
		const [channel, ...omit] = args
		return ipcRenderer.invoke(channel, ...omit)
	},
	// You can expose other APTs you need here.
	// ...
})

contextBridge.exposeInMainWorld('electron', {
	getInitialState: (noteId: string) => ipcRenderer.invoke('get-initial-state', noteId),

	// Atualiza o conteúdo de uma nota
	updateNote: (note: Note) => {
		ipcRenderer.send('update-note', note)
	},

	// Cria uma nova nota
	createNewNote: () => {
		ipcRenderer.send('create-new-note')
	},

	// Deleta uma nota
	deleteNote: (noteId: string) => {
		ipcRenderer.send('delete-note', noteId)
	},

	// Escuta atualizações de nota
	onNoteUpdated: (callback: (note: Note) => void) => {
		const listener = (_: unknown, note: Note) => callback(note)
		ipcRenderer.on('note-updated', listener)
		return () => ipcRenderer.removeListener('note-updated', listener)
	},

	// Escuta deleção de nota
	onNoteDeleted: (callback: (noteId: string) => void) => {
		const listener = (_: unknown, noteId: string) => callback(noteId)
		ipcRenderer.on('note-deleted', listener)
		return () => ipcRenderer.removeListener('note-deleted', listener)
	},

	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
})
