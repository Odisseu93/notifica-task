import { NoteNotification } from '../../interfaces/note-notification-interface'
import { Note } from '../../interfaces/note-interface'
import { AlarmSoundKeyType } from './app-notification'

declare global {
	interface Window {
		electron: {
			getInitialState: (noteId: string) => Promise<Note | undefined>
			updateNote: (note: Note) => void
			createNewNote: () => void
			deleteNote: (noteId: string) => void
			onNoteUpdated: (callback: (note: Note) => void) => () => void
			onNoteDeleted: (callback: (noteId: string) => void) => () => void
			updateNoteNotification: (notifcation: NoteNotification) => void
			deleteNoteNotification: (noteId: string) => void
			onNoteNotificationUpdated: (callback: (note: NoteNotification) => void) => () => void
			onNoteNotificationDeleted: (callback: (noteId: string) => void) => () => void
			getAppVersion: () => Promise<string>
			getNotificationSchedule: (noteId: string) => Promise<NoteNotification>
			setNotificationSound: (sound: string) => Promise<void>
			getNotificationSound: () => Promise<AlarmSoundKeyType>
			closeAllNotes: () => Promise<void>
			openAllNotes: () => Promise<void>
			deleteAllNotes: () => Promise<void>
			hideMainWindow: () => Promise<void>
			openAboutWindow: () => Promise<void>
			getAboutInfo: () => Promise<{
				appName: string
				appVersion: string
				nodeVersion: string
				chromeVersion: string
				electronVersion: string
				platform: string
				arch: string
			}>
			closeAboutWindow: () => Promise<void>
			closeApp: () => Promise<void>
			getAutoStart: () => Promise<boolean>
			setAutoStart: (enabled: boolean) => Promise<boolean>
		}
	}
}

export const api = window.electron
