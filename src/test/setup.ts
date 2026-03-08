import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

const electronMock = {
	getInitialState: vi.fn(() => Promise.resolve(undefined)),
	updateNote: vi.fn(),
	createNewNote: vi.fn(),
	deleteNote: vi.fn(),
	onNoteUpdated: vi.fn(() => vi.fn()),
	onNoteDeleted: vi.fn(() => vi.fn()),
	updateNoteNotification: vi.fn(),
	deleteNoteNotification: vi.fn(),
	onNoteNotificationUpdated: vi.fn(() => vi.fn()),
	onNoteNotificationDeleted: vi.fn(() => vi.fn()),
	onCheckNotificationSchedule: vi.fn(() => vi.fn()),
	getNotificationSchedule: vi.fn(() => Promise.resolve({})),
	setNotificationSound: vi.fn(),
	getNotificationSound: vi.fn(() => Promise.resolve('default')),
	closeAllNotes: vi.fn(() => Promise.resolve()),
	openAllNotes: vi.fn(() => Promise.resolve()),
	deleteAllNotes: vi.fn(() => Promise.resolve()),
	hideMainWindow: vi.fn(() => Promise.resolve()),
	openAboutWindow: vi.fn(() => Promise.resolve()),
	closeAboutWindow: vi.fn(() => Promise.resolve()),
	closeApp: vi.fn(() => Promise.resolve()),
	getAboutInfo: vi.fn(() =>
		Promise.resolve({
			appName: 'Notifica Task',
			appVersion: '1.0.0',
			nodeVersion: '20.0.0',
			chromeVersion: '120.0',
			electronVersion: '30.0.0',
			platform: 'win32',
			arch: 'x64',
		})
	),
	getAutoStart: vi.fn(() => Promise.resolve(false)),
	setAutoStart: vi.fn(() => Promise.resolve(true)),
}

const win = globalThis.window as Window & {
	electron: typeof electronMock
	close: typeof vi.fn
}
win.electron = electronMock
win.close = vi.fn()

