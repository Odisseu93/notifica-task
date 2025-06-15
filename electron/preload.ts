import { ipcRenderer, contextBridge } from 'electron'
import { Note } from '../interfaces/note-interface'
import { NoteNotification } from '../interfaces/note-notification-interface'
import { AlarmSoundKeyType } from '@/libs/app-notification'

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

	getNotificationSchedule: (noteId: string) => ipcRenderer.invoke('get-notification-schedule', noteId),

	updateNoteNotification: (notificaition: NoteNotification) => {
		ipcRenderer.send('set-note-notification', notificaition)
	},

	deleteNoteNotification: (noteId: string) => {
		ipcRenderer.send('delete-note-notification', noteId)
	},

	onNoteNotificationUpdated: (callback: (notification: NoteNotification) => void) => {
		const listener = (_: unknown, notification: NoteNotification) => callback(notification)
		ipcRenderer.on('note-notification-updated', listener)
		return () => ipcRenderer.removeListener('note-updated', listener)
	},

	onNoteNotificationDeleted: (callback: (noteId: string) => void) => {
		const listener = (_: unknown, noteId: string) => callback(noteId)
		ipcRenderer.on('note-notification-deleted', listener)
		return () => ipcRenderer.removeListener('note-deleted', listener)
	},

	closeAllNotes: () => ipcRenderer.invoke('close-all-notes'),

	openAllNotes: () => ipcRenderer.invoke('open-all-notes'),

	deleteAllNotes: () => ipcRenderer.invoke('delete-all-notes'),

	hideMainWindow: () => ipcRenderer.invoke('hide-main-window'),

	openAboutWindow: () => ipcRenderer.invoke('open-about-window'),

	closeApp: () => ipcRenderer.invoke('close-app'),

	setNotificationSound: (sound: AlarmSoundKeyType) => ipcRenderer.send('change-notification-sound', sound),

	getNotificationSound: () => ipcRenderer.invoke('get-notification-sound'),

	getAboutInfo: () => ipcRenderer.invoke('get-about-info'),

	closeAboutWindow: () => ipcRenderer.invoke('close-about-window'),

	getAutoStart: () => ipcRenderer.invoke('get-auto-launch'),

	setAutoStart: (enabled: boolean) => ipcRenderer.invoke('set-auto-launch', enabled),
})
