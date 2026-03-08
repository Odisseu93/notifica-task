/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type {} from './api'
import { api } from './api'

describe('API (IPC contract)', () => {
	beforeEach(() => {
		vi.mocked(window.electron.getInitialState).mockResolvedValue(undefined)
		vi.mocked(window.electron.getNotificationSchedule).mockResolvedValue(undefined)
	})

	it('getInitialState(noteId) calls electron and returns Promise<Note | undefined>', async () => {
		vi.mocked(window.electron.getInitialState).mockResolvedValueOnce({
			id: 'n1',
			content: 'hi',
			x: 0,
			y: 0,
		})
		const result = await api.getInitialState('n1')
		expect(window.electron.getInitialState).toHaveBeenCalledWith('n1')
		expect(result).toEqual({ id: 'n1', content: 'hi', x: 0, y: 0 })
	})

	it('getNotificationSchedule(noteId) calls electron and returns Promise<NoteNotification | undefined>', async () => {
		const schedule = {
			noteId: 'n1',
			scheduleDate: '2025-12-01T10:00:00.000Z',
			recurrence: null as const,
		}
		vi.mocked(window.electron.getNotificationSchedule).mockResolvedValueOnce(schedule)
		const result = await api.getNotificationSchedule('n1')
		expect(window.electron.getNotificationSchedule).toHaveBeenCalledWith('n1')
		expect(result).toEqual(schedule)
	})

	it('updateNoteNotification calls electron with notification payload', () => {
		const notification = {
			noteId: 'n1',
			scheduleDate: '2025-12-01T10:00:00.000Z',
			recurrence: 'daily' as const,
		}
		api.updateNoteNotification(notification)
		expect(window.electron.updateNoteNotification).toHaveBeenCalledWith(notification)
	})

	it('deleteNoteNotification(noteId) calls electron', () => {
		api.deleteNoteNotification('n1')
		expect(window.electron.deleteNoteNotification).toHaveBeenCalledWith('n1')
	})

	it('closeAboutWindow calls electron and returns Promise', async () => {
		await api.closeAboutWindow()
		expect(window.electron.closeAboutWindow).toHaveBeenCalled()
	})

	it('openAllNotes calls electron and returns Promise', async () => {
		await api.openAllNotes()
		expect(window.electron.openAllNotes).toHaveBeenCalled()
	})
})
