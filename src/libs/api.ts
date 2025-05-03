import { Note } from '../../interfaces/note-interfaces'

declare global {
	interface Window {
		electron: {
			getInitialState: (noteId: string) => Promise<Note | undefined>
			updateNote: (note: Note) => void
			createNewNote: () => void
			deleteNote: (noteId: string) => void
			onNoteUpdated: (callback: (note: Note) => void) => () => void
			onNoteDeleted: (callback: (noteId: string) => void) => () => void
			getAppVersion: () => Promise<string>
		}
	}
}

export const api = window.electron
