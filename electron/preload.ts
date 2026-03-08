import { ipcRenderer, contextBridge } from 'electron'
import { Note } from '../interfaces/note-interface'
import { NoteNotification } from '../interfaces/note-notification-interface'
import { AlarmSoundKeyType } from '@/libs/app-notification'

contextBridge.exposeInMainWorld('electron', {
	getInitialState: (noteId: string) => ipcRenderer.invoke('get-initial-state', noteId),

	updateNote: (note: Note) => {
		ipcRenderer.send('update-note', note)
	},

	createNewNote: () => {
		ipcRenderer.send('create-new-note')
	},

	deleteNote: (noteId: string) => {
		ipcRenderer.send('delete-note', noteId)
	},

	onNoteUpdated: (callback: (note: Note) => void) => {
		const listener = (_: unknown, note: Note) => callback(note)
		ipcRenderer.on('note-updated', listener)
		return () => ipcRenderer.removeListener('note-updated', listener)
	},

	onNoteDeleted: (callback: (noteId: string) => void) => {
		const listener = (_: unknown, noteId: string) => callback(noteId)
		ipcRenderer.on('note-deleted', listener)
		return () => ipcRenderer.removeListener('note-deleted', listener)
	},

	onCheckNotificationSchedule: (callback: (scheduleNotifications: Record<string, NoteNotification> | undefined) => void) => {
		const listener = (_: unknown, scheduleNotifications: Record<string, NoteNotification> | undefined) =>
			callback(scheduleNotifications)
		ipcRenderer.on('check-notification-schedule', listener)
		return () => ipcRenderer.removeListener('check-notification-schedule', listener)
	},

	getNotificationSchedule: (noteId: string) => ipcRenderer.invoke('get-notification-schedule', noteId),

	updateNoteNotification: (notification: NoteNotification) => {
		ipcRenderer.send('set-note-notification', notification)
	},

	deleteNoteNotification: (noteId: string) => {
		ipcRenderer.send('delete-note-notification', noteId)
	},

	onNoteNotificationUpdated: (callback: (notification: NoteNotification) => void) => {
		const listener = (_: unknown, notification: NoteNotification) => callback(notification)
		ipcRenderer.on('note-notification-updated', listener)
		return () => ipcRenderer.removeListener('note-notification-updated', listener)
	},

	onNoteNotificationDeleted: (callback: (noteId: string) => void) => {
		const listener = (_: unknown, noteId: string) => callback(noteId)
		ipcRenderer.on('note-notification-deleted', listener)
		return () => ipcRenderer.removeListener('note-notification-deleted', listener)
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

	getLocale: () => ipcRenderer.invoke('get-locale'),

	setLocale: (locale: string) => ipcRenderer.invoke('set-locale', locale),

	onLocaleUpdated: (callback: (locale: string) => void) => {
		const listener = (_: unknown, locale: string) => callback(locale)
		ipcRenderer.on('locale-updated', listener)
		return () => ipcRenderer.removeListener('locale-updated', listener)
	},
})
